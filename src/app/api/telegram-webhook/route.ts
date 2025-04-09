import { NextRequest, NextResponse } from "next/server";
import { Client, Databases, ID, Models, Query } from "appwrite";

// Environment vars
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_API!;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT!;
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID!;
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY!;

// Appwrite IDs
const DB_ID = "67eaf6a0002147077712";
const USERS_COLLECTION = "67f64d80000eb41830cf";
const SESSIONS_COLLECTION = "67f64e0800239fe47ea6";
const CHATS_COLLECTION = "67f64e850019bd0f6c97";

// Interfaces
interface UserDoc extends Models.Document {
  telegramId: string;
  month: string;
  usageCount: number;
}
interface SessionDoc extends Models.Document {
  userId: string;
  context: string;
  active: boolean;
}
interface ChatDoc extends Models.Document {
  sessionId: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
}
interface TelegramUpdate {
  message?: { chat: { id: string | number }; text?: string };
}
interface ReplyKeyboardMarkup {
  keyboard: Array<Array<{ text: string }>>;
  resize_keyboard?: boolean;
}
interface OpenRouterResult {
  choices?: Array<{ message?: { content?: string } }>;
}

// Appwrite client setup
const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);
client.headers["X-Appwrite-Key"] = APPWRITE_API_KEY;
const databases = new Databases(client);

// ===== Main webhook ====
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { message } = (await req.json()) as TelegramUpdate;
    if (!message) return NextResponse.json({ status: "ok" });

    const chatId = message.chat.id.toString();
    const text = (message.text ?? "").trim();

    const user = await upsertAndCheckUser(chatId);
    if (!user) {
      await sendTelegram(chatId, "خطا در بررسی کاربر، دوباره تلاش کنید.");
      return NextResponse.json({ status: "ok" });
    }
    if (user.usageCount >= 400) {
      await sendTelegram(chatId, "محدودیت ۴۰۰ پیام شما پر شده است!");
      return NextResponse.json({ status: "ok" });
    }

    if (/^\/start/i.test(text)) {
      await sendTelegram(chatId, "سلام! پیام بفرستید یا گزینه‌ها:", mainMenu());
      return NextResponse.json({ status: "ok" });
    }
    if (/^\/help/i.test(text)) {
      await sendTelegram(
        chatId,
        "دستورات:\n/start\n/newchat\n/summary100\n/summaryall\n/youtube",
        mainMenu()
      );
      return NextResponse.json({ status: "ok" });
    }
    if (/^\/youtube/i.test(text)) {
      await sendTelegram(
        chatId,
        "کانال:\nhttps://t.me/sokhannegar_bot",
        mainMenu()
      );
      return NextResponse.json({ status: "ok" });
    }
    if (/^\/newchat/i.test(text)) {
      await deactivateSessions(chatId);
      await createSession(chatId, "");
      await sendTelegram(chatId, "گفتگو جدید آغاز شد.", mainMenu());
      return NextResponse.json({ status: "ok" });
    }
    if (/^\/summary(all|100)/i.test(text)) {
      const limit = text.includes("100") ? 100 : 1000;
      const chats = await fetchUserChats(chatId, limit);
      const summary = await summarizeChats(chats);
      const sess = await getOrStartActiveSession(chatId);
      await updateSessionContext(sess.$id, summary);
      await sendTelegram(chatId, "خلاصه ذخیره شد.", mainMenu());
      return NextResponse.json({ status: "ok" });
    }

    // Chat prompt
    const sess = await getOrStartActiveSession(chatId);
    await saveChat(sess.$id, chatId, "user", text);

    const history = await fetchSessionChats(sess.$id, 10);

    let prompt = `سابقه خلاصه شده:\n${sess.context || "ندارد"}\n\n`;
    prompt += "چت‌های اخیر:\n";
    for (const m of history)
      prompt += `${m.role === "user" ? "کاربر" : "دستیار"}: ${m.content}\n`;
    prompt += `\nپیام کاربر:\n${text}\n\n`;
    prompt += "پاسخ بده فقط فارسی و کمتر از ۳۰۰۰ کاراکتر.";

    const aiReply = (await askQuasar(prompt)).slice(0, 3000);
    await saveChat(sess.$id, chatId, "assistant", aiReply);

    await databases.updateDocument(DB_ID, USERS_COLLECTION, user.$id, {
      usageCount: user.usageCount + 1,
    });

    await sendTelegram(chatId, aiReply, mainMenu());
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ status: "ok" });
  }
}

// ===== USERS ====
async function upsertAndCheckUser(telegramId: string): Promise<UserDoc | null> {
  const month = new Date().toISOString().slice(0, 7);
  try {
    const found = await databases.listDocuments<UserDoc>(
      DB_ID,
      USERS_COLLECTION,
      [Query.equal("telegramId", telegramId)]
    );

    if (found.total === 0) {
      return await databases.createDocument<UserDoc>(
        DB_ID,
        USERS_COLLECTION,
        ID.unique(),
        { telegramId, month, usageCount: 0 }
      );
    } else {
      const user = found.documents[0];
      if (user.month !== month) {
        return await databases.updateDocument<UserDoc>(
          DB_ID,
          USERS_COLLECTION,
          user.$id,
          { month, usageCount: 0 }
        );
      }
      return user;
    }
  } catch {
    return null;
  }
}

async function deactivateSessions(userId: string) {
  try {
    const sessions = await databases.listDocuments<SessionDoc>(
      DB_ID,
      SESSIONS_COLLECTION,
      [Query.equal("userId", userId), Query.equal("active", true)]
    );
    for (const s of sessions.documents) {
      await databases.updateDocument(DB_ID, SESSIONS_COLLECTION, s.$id, {
        active: false,
      });
    }
  } catch {}
}

async function createSession(
  userId: string,
  context = ""
): Promise<SessionDoc | null> {
  try {
    return await databases.createDocument<SessionDoc>(
      DB_ID,
      SESSIONS_COLLECTION,
      ID.unique(),
      {
        userId,
        active: true,
        context,
      }
    );
  } catch {
    return null;
  }
}

async function getOrStartActiveSession(userId: string): Promise<SessionDoc> {
  try {
    const r = await databases.listDocuments<SessionDoc>(
      DB_ID,
      SESSIONS_COLLECTION,
      [Query.equal("userId", userId), Query.equal("active", true)]
    );
    if (r.total > 0) return r.documents[0];
    return (await createSession(userId)) as SessionDoc;
  } catch {
    throw new Error("session error");
  }
}

async function updateSessionContext(sessionId: string, context: string) {
  try {
    await databases.updateDocument(DB_ID, SESSIONS_COLLECTION, sessionId, {
      context,
    });
  } catch {}
}

async function saveChat(
  sessionId: string,
  userId: string,
  role: "user" | "assistant",
  content: string
) {
  try {
    await databases.createDocument<ChatDoc>(
      DB_ID,
      CHATS_COLLECTION,
      ID.unique(),
      {
        sessionId,
        userId,
        role,
        content,
      }
    );
  } catch {}
}

async function fetchSessionChats(
  sessionId: string,
  limit = 10
): Promise<ChatDoc[]> {
  try {
    const list = await databases.listDocuments<ChatDoc>(
      DB_ID,
      CHATS_COLLECTION,
      [
        Query.equal("sessionId", sessionId),
        Query.limit(limit),
        Query.orderDesc("$createdAt"),
      ]
    );
    return list.documents.reverse();
  } catch {
    return [];
  }
}

async function fetchUserChats(userId: string, limit = 100): Promise<ChatDoc[]> {
  try {
    const list = await databases.listDocuments<ChatDoc>(
      DB_ID,
      CHATS_COLLECTION,
      [
        Query.equal("userId", userId),
        Query.limit(limit),
        Query.orderDesc("$createdAt"),
      ]
    );
    return list.documents.reverse();
  } catch {
    return [];
  }
}

async function summarizeChats(chats: ChatDoc[]): Promise<string> {
  if (!chats.length) return "پیامی موجود نیست.";
  const joined = chats
    .map((c) => `${c.role === "user" ? "کاربر" : "دستیار"}: ${c.content}`)
    .join("\n");
  const prompt = `متن زیر را خلاصه کن در ۳۰۰۰ کاراکتر و فارسی:\n${joined}`;
  return (await askQuasar(prompt)).slice(0, 3000);
}

async function askQuasar(prompt: string): Promise<string> {
  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "quasar-openai/quasar-7b-chat-alpha",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const d: OpenRouterResult = await r.json();
    return d.choices?.[0]?.message?.content?.trim() ?? "پاسخی دریافت نشد.";
  } catch {
    return "خطا در پاسخ هوش مصنوعی";
  }
}

async function sendTelegram(
  chatId: string | number,
  text: string,
  replyMarkup?: ReplyKeyboardMarkup
) {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        reply_markup: replyMarkup,
      }),
    });
  } catch {}
}

function mainMenu(): ReplyKeyboardMarkup {
  return {
    keyboard: [
      [{ text: "/newchat" }, { text: "/youtube" }],
      [{ text: "/summary100" }, { text: "/summaryall" }],
      [{ text: "/help" }],
    ],
    resize_keyboard: true,
  };
}
