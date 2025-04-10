// app/api/telegram/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  Client as AppwriteClient,
  Databases as AppwriteDatabases,
  ID as AppwriteID,
  Query as AppwriteQuery,
  Models,
} from "appwrite";

export async function POST(req: NextRequest) {
  // Environment variables from .env.local
  const TELEGRAM_TOKEN =
    process.env.TELEGRAM_TOKEN ||
    "7797121309:AAHETVcA0lSWjEvw0YjB4Dz9zwcUvI3LcxE";
  const OPENROUTER_API_KEY =
    process.env.OPENROUTER_API_KEY ||
    "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";
  const APPWRITE_ENDPOINT =
    process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
  const APPWRITE_PROJECT_ID =
    process.env.APPWRITE_PROJECT_ID || "67eada210010f822c77b";

  const DB_ID = "67eaf6a0002147077712";
  const USERS_COLLECTION = "67f64d80000eb41830cf";
  const SESSIONS_COLLECTION = "67f64e0800239fe47ea6";
  const CHATS_COLLECTION = "67f64e850019bd0f6c97";

  // Initialize Appwrite client
  const client = new AppwriteClient()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID);

  const db = new AppwriteDatabases(client);

  // Parse request body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
    console.log(`Parsed Telegram update: ${JSON.stringify(body)}`);
  } catch (e) {
    console.error(`Failed to parse request body: ${String(e)}`);
    body = {};
  }

  const message = body.message as
    | { chat: { id: number }; text?: string }
    | undefined;
  const update_id = body.update_id as number | undefined;
  if (!message) {
    console.log(`No message in update (update_id: ${update_id || "unknown"})`);
    return NextResponse.json({ status: "ok" });
  }

  const chatId = message.chat.id.toString();
  const text = (message.text ?? "").trim();
  console.log(
    `Processing message from chat ${chatId}: "${text}" (update_id: ${update_id})`
  );

  try {
    const user = await upsertUser(chatId);
    if (!user) {
      console.error(`User upsert failed for chat ${chatId}`);
      await tg(chatId, "خطا در ثبت کاربر");
      return NextResponse.json({ status: "ok" });
    }
    if (user.usageCount >= 400) {
      console.log(`Usage limit reached for chat ${chatId}: ${user.usageCount}`);
      await tg(chatId, "سقف مصرف ماهانه پر شده");
      return NextResponse.json({ status: "ok" });
    }

    if (/^\/start/i.test(text)) {
      console.log("Handling /start command");
      await tg(chatId, "سلام! پیام بده یا گزینه‌ها را انتخاب کن", menu());
      return NextResponse.json({ status: "ok" });
    }
    if (/^\/help/i.test(text)) {
      console.log("Handling /help command");
      await tg(
        chatId,
        "/start\n/newchat\n/summary100\n/summaryall\n/youtube",
        menu()
      );
      return NextResponse.json({ status: "ok" });
    }
    if (/^\/youtube/i.test(text)) {
      console.log("Handling /youtube command");
      await tg(chatId, "کانال: https://t.me/sokhannegar_bot", menu());
      return NextResponse.json({ status: "ok" });
    }
    if (/^\/newchat/i.test(text)) {
      console.log("Handling /newchat command");
      await finishSessions(chatId);
      await createSession(chatId, "");
      await tg(chatId, "چت جدید آغاز شد", menu());
      return NextResponse.json({ status: "ok" });
    }
    if (/^\/summary(all|100)/i.test(text)) {
      console.log("Handling summary command");
      const lim = text.includes("100") ? 100 : 1000;
      const chats = await chatsUser(chatId, lim);
      const sum = await summarize(chats);
      const sess = await getActive(chatId);
      if (!sess) {
        console.error(`No active session for chat ${chatId} during summary`);
        await tg(chatId, "خطا در خلاصه‌سازی");
        return NextResponse.json({ status: "ok" });
      }
      await db.updateDocument(DB_ID, SESSIONS_COLLECTION, sess.$id, {
        context: sum,
      });
      await tg(chatId, "خلاصه ایجاد شد", menu());
      return NextResponse.json({ status: "ok" });
    }

    console.log("Processing as chat message");
    const sess = await getActive(chatId);
    if (!sess) {
      console.error(`No active session for chat ${chatId}`);
      await tg(chatId, "خطا در شروع چت");
      return NextResponse.json({ status: "ok" });
    }
    await saveChat(sess.$id, chatId, "user", text);
    const history = await chatsSession(sess.$id, 10);

    let prompt = `سابقه:\n${sess.context || "ندارد"}\n\n`;
    history.forEach((c) => {
      prompt += `${c.role === "user" ? "کاربر" : "دستیار"}: ${c.content}\n`;
    });
    prompt += `\nپیام کاربر:\n${text}\nپاسخ به فارسی`;

    console.log(`Sending prompt to AI: ${prompt.slice(0, 100)}...`);
    const aiResponse = await askAI(prompt).catch((e) => {
      console.error(`AI processing error: ${String(e)}`);
      return "پاسخگویی با خطا مواجه شد، لطفاً دوباره تلاش کنید";
    });

    console.log(`AI response received: ${aiResponse.slice(0, 100)}...`);
    await saveChat(sess.$id, chatId, "assistant", aiResponse);
    await db.updateDocument(DB_ID, USERS_COLLECTION, user.$id, {
      usageCount: user.usageCount + 1,
    });
    await tg(chatId, aiResponse, menu());

    return NextResponse.json({ status: "ok" });
  } catch (e) {
    console.error(`Main execution error: ${String(e)}`);
    await tg(chatId, "خطایی رخ داد، لطفاً دوباره تلاش کنید", menu());
    return NextResponse.json({ status: "ok" });
  }

  // Helper Functions
  async function upsertUser(tid: string): Promise<Models.Document | null> {
    const month = new Date().toISOString().slice(0, 7);
    try {
      const u = await db.listDocuments(DB_ID, USERS_COLLECTION, [
        AppwriteQuery.equal("telegramId", tid),
      ]);
      if (u.total === 0) {
        console.log(`Creating new user for telegramId: ${tid}`);
        return await db.createDocument(
          DB_ID,
          USERS_COLLECTION,
          AppwriteID.unique(),
          {
            telegramId: tid,
            month,
            usageCount: 0,
          }
        );
      }
      const doc = u.documents[0];
      if (doc.month !== month) {
        console.log(`Resetting user month for telegramId: ${tid}`);
        return await db.updateDocument(DB_ID, USERS_COLLECTION, doc.$id, {
          month,
          usageCount: 0,
        });
      }
      return doc;
    } catch (e) {
      console.error(`upsertUser error: ${String(e)}`);
      return null;
    }
  }

  async function finishSessions(uid: string): Promise<void> {
    try {
      const s = await db.listDocuments(DB_ID, SESSIONS_COLLECTION, [
        AppwriteQuery.equal("userId", uid),
        AppwriteQuery.equal("active", true),
      ]);
      for (const doc of s.documents) {
        await db.updateDocument(DB_ID, SESSIONS_COLLECTION, doc.$id, {
          active: false,
        });
      }
      console.log(`Finished ${s.total} sessions for user ${uid}`);
    } catch (e) {
      console.error(`finishSessions error: ${String(e)}`);
    }
  }

  async function createSession(
    uid: string,
    context: string
  ): Promise<Models.Document | null> {
    try {
      const doc = await db.createDocument(
        DB_ID,
        SESSIONS_COLLECTION,
        AppwriteID.unique(),
        {
          userId: uid,
          active: true,
          context,
        }
      );
      console.log(`Created session ${doc.$id} for user ${uid}`);
      return doc;
    } catch (e) {
      console.error(`createSession error: ${String(e)}`);
      return null;
    }
  }

  async function getActive(uid: string): Promise<Models.Document | null> {
    try {
      const s = await db.listDocuments(DB_ID, SESSIONS_COLLECTION, [
        AppwriteQuery.equal("userId", uid),
        AppwriteQuery.equal("active", true),
      ]);
      if (s.total > 0) return s.documents[0];
      return await createSession(uid, "");
    } catch (e) {
      console.error(`getActive error: ${String(e)}`);
      return null;
    }
  }

  async function saveChat(
    sid: string,
    uid: string,
    role: string,
    content: string
  ): Promise<void> {
    try {
      const doc = await db.createDocument(
        DB_ID,
        CHATS_COLLECTION,
        AppwriteID.unique(),
        {
          sessionId: sid,
          userId: uid,
          role,
          content,
        }
      );
      console.log(`Saved chat ${doc.$id} in session ${sid}`);
    } catch (e) {
      console.error(`saveChat error: ${String(e)}`);
    }
  }

  async function chatsSession(
    sid: string,
    limit: number
  ): Promise<Models.Document[]> {
    try {
      const c = await db.listDocuments(DB_ID, CHATS_COLLECTION, [
        AppwriteQuery.equal("sessionId", sid),
        AppwriteQuery.orderDesc("$createdAt"),
        AppwriteQuery.limit(limit),
      ]);
      return c.documents.reverse();
    } catch (e) {
      console.error(`chatsSession error: ${String(e)}`);
      return [];
    }
  }

  async function chatsUser(
    uid: string,
    limit: number
  ): Promise<Models.Document[]> {
    try {
      const c = await db.listDocuments(DB_ID, CHATS_COLLECTION, [
        AppwriteQuery.equal("userId", uid),
        AppwriteQuery.orderDesc("$createdAt"),
        AppwriteQuery.limit(limit),
      ]);
      return c.documents.reverse();
    } catch (e) {
      console.error(`chatsUser error: ${String(e)}`);
      return [];
    }
  }

  async function summarize(chats: Models.Document[]): Promise<string> {
    if (!chats.length) return "پیامی نیست";
    const concat = chats
      .map((c) => `${c.role === "user" ? "کاربر" : "دستیار"}: ${c.content}`)
      .join("\n");
    return await askAI(`متن زیر را خلاصه کن به فارسی:\n${concat}`);
  }

  async function askAI(prompt: string): Promise<string> {
    console.log(`Calling askAI with prompt: ${prompt.slice(0, 100)}...`);
    try {
      const requestBody = {
        model: "openrouter/quasar-alpha",
        messages: [{ role: "user", content: prompt }],
      };
      console.log(
        `Sending request to OpenRouter: ${JSON.stringify(requestBody)}`
      );

      const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`OpenRouter response status: ${r.status} ${r.statusText}`);
      if (!r.ok) {
        const errorText = await r.text();
        throw new Error(`HTTP ${r.status}: ${r.statusText} - ${errorText}`);
      }

      const d = await r.json();
      console.log(`OpenRouter response data: ${JSON.stringify(d)}`);

      if (!d.choices || !d.choices[0] || !d.choices[0].message) {
        throw new Error("Invalid response format: no choices available");
      }

      return d.choices[0].message.content || "پاسخی نبود";
    } catch (e) {
      console.error(`askAI error: ${String(e)}`);
      throw e;
    }
  }

  async function tg(
    chatId: string,
    text: string,
    reply_markup?: { keyboard: { text: string }[][]; resize_keyboard: boolean }
  ): Promise<void> {
    try {
      const requestBody = {
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        reply_markup,
      };
      console.log(`Sending to Telegram: ${JSON.stringify(requestBody)}`);
      const r = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );
      console.log(`Telegram response status: ${r.status} ${r.statusText}`);
      if (!r.ok) {
        const errorText = await r.text();
        console.error(
          `Telegram API error: ${r.status} ${r.statusText} - ${errorText}`
        );
      }
    } catch (e) {
      console.error(`tg error: ${String(e)}`);
    }
  }

  function menu(): {
    keyboard: { text: string }[][];
    resize_keyboard: boolean;
  } {
    return {
      keyboard: [
        [{ text: "/newchat" }, { text: "/youtube" }],
        [{ text: "/summary100" }, { text: "/summaryall" }],
        [{ text: "/help" }],
      ],
      resize_keyboard: true,
    };
  }
}
