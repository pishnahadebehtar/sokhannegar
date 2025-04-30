import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { OpenAI } from "openai";
import { db, ID, Query } from "../../../utils/appwrite";
import {
  UserDoc,
  SessionDoc,
  ChatDoc,
  NoteDoc,
  NoteChunkDoc,
} from "../../../types/types";
import { Document, Paragraph, Packer, TextRun, HeadingLevel } from "docx";

// Initialize AvalAI client
const openai = new OpenAI({
  apiKey: process.env.AVALAI_API_KEY,
  baseURL: "https://api.avalai.ir/v1",
});

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { message: "لطفاً ابتدا وارد شوید.", buttons: menu() },
        { status: 401 }
      );
    }

    // Parse request body
    const { clerkId, text, sessionId, role } = await req.json();
    console.log("POST /api/chat:", { clerkId, text, sessionId, role, userId });
    if (!clerkId || !text || !sessionId) {
      return NextResponse.json(
        { message: "ورودی‌های مورد نیاز گم شده‌اند.", buttons: menu() },
        { status: 400 }
      );
    }

    if (clerkId !== userId) {
      return NextResponse.json(
        { message: "عدم تطابق کاربر.", buttons: menu() },
        { status: 403 }
      );
    }

    // Fetch or create user
    const user = await upsertUser(clerkId);
    if (!user) {
      return NextResponse.json(
        { message: "🚫 خطا در ثبت کاربر", buttons: menu() },
        { status: 500 }
      );
    }

    // Check usage limit (400 messages per month)
    if (user.usageCount >= 400) {
      return NextResponse.json(
        { message: "⛔ سقف مصرف ماهانه پر شده", buttons: menu() },
        { status: 403 }
      );
    }

    // Handle assistant role (for guidance messages)
    if (role === "assistant") {
      await saveChat(sessionId, clerkId, "assistant", text);
      console.log("Saved guidance message:", { sessionId, role, text });
      return NextResponse.json({ message: text, buttons: menu() });
    }

    // Handle commands
    if (/^\/start/i.test(text) || text === "back_to_menu") {
      await finishNote(clerkId);
      const message =
        "👋 سلام! من چت هوشمند هستم.\nپیام متنی یا صوتی بفرستید تا با من چت کنید!\n\n✨ برای شروع، یک گزینه را انتخاب کنید.";
      await saveChat(sessionId, clerkId, "assistant", message);
      return NextResponse.json({ message, buttons: menu() });
    }

    if (/^\/help/i.test(text)) {
      const message =
        "ℹ️ راهنما:\n/start - شروع چت\n/newchat - چت جدید\n/summary100 - خلاصه ۱۰۰ پیام\n/summaryall - خلاصه همه پیام‌ها\n/youtube - لینک کانال\n/makenote - ساخت یادداشت جدید\nارسال پیام صوتی پشتیبانی می‌شود!\n\nℹ️ برای اطلاعات بیشتر، پیام خود را ارسال کنید.";
      await saveChat(sessionId, clerkId, "assistant", message);
      return NextResponse.json({ message, buttons: menu() });
    }

    if (/^\/youtube/i.test(text)) {
      const message =
        "🌟 اگه از این چت‌بات هوشمند رایگان لذت می‌برید، لطفاً به کانال یوتیوب ما سر بزنید و سابسکرایب کنید! 👇\nhttps://www.youtube.com/@pishnahadebehtar\n\n👉 لطفاً لینک را باز کنید و کانال را سابسکرایب کنید!";
      await saveChat(sessionId, clerkId, "assistant", message);
      return NextResponse.json({ message, buttons: menu() });
    }

    if (/^\/newchat/i.test(text)) {
      await finishSessions(clerkId);
      await finishNote(clerkId);
      const newSession = await createSession(clerkId, "");
      if (!newSession) {
        return NextResponse.json(
          { message: "🚫 خطا در ایجاد چت جدید", buttons: menu() },
          { status: 500 }
        );
      }
      const message =
        "✨ چت جدید آغاز شد!\nپیام متنی یا صوتی جدیدی بفرستید تا دوباره شروع کنیم.\n\n✨ چت جدید شروع شد. پیام خود را ارسال کنید!";
      await saveChat(newSession.$id, clerkId, "assistant", message);
      return NextResponse.json({ message, buttons: menu() });
    }

    if (/^\/summary(all|100)/i.test(text)) {
      const lim = text.includes("100") ? 100 : 1000;
      const chats = await chatsUser(clerkId, lim);
      const sum = await summarize(chats);
      const sess = await getActive(clerkId);
      if (!sess) {
        return NextResponse.json(
          { message: "🚫 خطا در دریافت جلسه فعال", buttons: menu() },
          { status: 500 }
        );
      }
      await db.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DB_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_SESSIONS_COLLECTION_ID!,
        sess.$id,
        { context: sum }
      );
      const message = sum.includes("پیامی نیست")
        ? `${sum}\n\n📭 برای خلاصه‌سازی، ابتدا چند پیام ارسال کنید.`
        : `📝 خلاصه ایجاد شد!\n${sum}\n\n📜 خلاصه ${
            lim === 100 ? "۱۰۰ پیام" : "همه پیام‌ها"
          } را مشاهده کردید.`;
      await saveChat(sessionId, clerkId, "assistant", message);
      return NextResponse.json({ message, buttons: menu() });
    }

    if (/^\/makenote/i.test(text) || text === "make_new_note") {
      await finishNote(clerkId);
      const note = await createNote(clerkId);
      if (!note) {
        const message = "🚫 خطا در ایجاد یادداشت جدید. لطفاً دوباره تلاش کنید.";
        await saveChat(sessionId, clerkId, "assistant", message);
        return NextResponse.json({ message, buttons: menu() });
      }
      await setUserState(clerkId, "note_making", note.$id);
      const message =
        "📝 آماده ساخت یادداشت جدید! لطفاً متن یادداشت را وارد کنید.\n\n📝 محتوای یادداشت خود را وارد کنید.";
      await saveChat(sessionId, clerkId, "assistant", message);
      return NextResponse.json({ message, buttons: noteMenu() });
    }

    if (text === "resume_note") {
      const userState = await getUserState(clerkId);
      const isNoteMaking =
        userState?.mode === "note_making" && userState?.activeNoteId;
      if (!isNoteMaking) {
        const message =
          "🚫 هیچ یادداشت فعالی وجود ندارد. لطفاً یک یادداشت جدید بسازید.\n\n📝 برای شروع یادداشت جدید، گزینه 'ساخت یادداشت جدید' را انتخاب کنید.";
        await saveChat(sessionId, clerkId, "assistant", message);
        return NextResponse.json({ message, buttons: menu() });
      }
      const message =
        "📝 لطفاً ویس یا متن جدید خود را برای افزودن به یادداشت ارسال کنید.\n\n📝 ادامه یادداشت خود را وارد کنید.";
      await saveChat(sessionId, clerkId, "assistant", message);
      return NextResponse.json({ message, buttons: noteMenu() });
    }

    if (text === "copy_note") {
      const userState = await getUserState(clerkId);
      const isNoteMaking =
        userState?.mode === "note_making" && userState?.activeNoteId;
      if (!isNoteMaking) {
        const message =
          "🚫 هیچ یادداشت فعالی وجود ندارد. لطفاً یک یادداشت جدید بسازید.\n\n📝 برای شروع یادداشت جدید، گزینه 'ساخت یادداشت جدید' را انتخاب کنید.";
        await saveChat(sessionId, clerkId, "assistant", message);
        return NextResponse.json({ message, buttons: menu() });
      }
      const fullNote = await getFullNoteText(userState.activeNoteId!);
      const message = fullNote
        ? `متن یادداشت: "${fullNote}"\n\n✅ لطفاً متن را کپی کنید.\n📋 متن یادداشت کپی شد.`
        : "🚫 یادداشت خالی است.\n\n📝 لطفاً متن یا ویس به یادداشت اضافه کنید.";
      await saveChat(sessionId, clerkId, "assistant", message);
      return NextResponse.json({ message, buttons: noteMenu() });
    }

    if (text === "export_to_word") {
      // Fetch all messages for the session
      const chats = await chatsSession(sessionId, 1000); // Adjust limit as needed
      if (!chats || chats.length === 0) {
        const message =
          "🚫 جلسه چت خالی است. لطفاً ابتدا پیام‌هایی ارسال کنید.";
        await saveChat(sessionId, clerkId, "assistant", message);
        return NextResponse.json({ message, buttons: menu() });
      }

      const docBuffer = await createWordDocument(chats, clerkId);
      const message =
        "📄 چت به ورد صادر شد.\n\n📄 فایل ورد چت صادر شده است. فایل را بررسی کنید.";
      await saveChat(sessionId, clerkId, "assistant", message);
      return new NextResponse(docBuffer, {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename=chat_${clerkId}_${Date.now()}.docx`,
        },
      });
    }

    // Handle regular chat
    const sess = await getActive(clerkId);
    if (!sess) {
      const message = "🚫 خطا در دریافت جلسه فعال";
      await saveChat(sessionId, clerkId, "assistant", message);
      return NextResponse.json({ message, buttons: menu() }, { status: 500 });
    }
    await saveChat(sess.$id, clerkId, "user", text);
    const history = await chatsSession(sess.$id, 10);

    let prompt = `سابقه:\n${sess.context || "ندارد"}\n\n`;
    history.forEach((c) => {
      prompt += `${c.role === "user" ? "کاربر" : "دستیار"}: ${c.content}\n`;
    });
    prompt += `\nپیام کاربر:\n${text}\nپاسخ به فارسی (حداکثر ۱۵۰۰ کاراکتر)`;

    const aiResponse = await askAI(prompt).catch((e) => {
      console.error(`AI error: ${(e as Error).message}`);
      return "⚠️ خطا در دریافت پاسخ از هوش مصنوعی. لطفاً دوباره تلاش کنید.";
    });

    await saveChat(sess.$id, clerkId, "assistant", aiResponse);
    await db.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DB_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
      user.$id,
      {
        usageCount: user.usageCount + 1,
      }
    );

    return NextResponse.json({ message: aiResponse, buttons: menu() });
  } catch (e) {
    console.error(`Main execution error: ${(e as Error).message}`);
    return NextResponse.json(
      {
        message: `🚨 خطایی رخ داد! جزئیات: ${(e as Error).message}`,
        buttons: menu(),
      },
      { status: 500 }
    );
  }
}

// Helper Functions
async function askAI(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 600,
    });
    console.log(
      `AvalAI response: ${JSON.stringify(response).slice(0, 100)}...`
    );
    return response.choices[0].message.content || "پاسخی نبود";
  } catch (e) {
    console.error(`askAI error: ${(e as Error).message}`);
    throw new Error(`Failed to get AI response: ${(e as Error).message}`);
  }
}

async function summarize(chats: ChatDoc[]): Promise<string> {
  if (!chats.length) return "📭 پیامی نیست";
  const concat = chats
    .map((c) => `${c.role === "user" ? "کاربر" : "دستیار"}: ${c.content}`)
    .join("\n");
  return await askAI(`متن زیر را خلاصه کن زیر ۱۵۰۰ کاراکتر فارسی:\n${concat}`);
}

async function upsertUser(clerkId: string): Promise<UserDoc | null> {
  const month = new Date().toISOString().slice(0, 7);
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_APPWRITE_DB_ID) {
      throw new Error(
        "Environment variable NEXT_PUBLIC_APPWRITE_DB_ID is not set"
      );
    }
    if (!process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID) {
      throw new Error(
        "Environment variable NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID is not set"
      );
    }

    const u = await db.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DB_ID,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
      [Query.equal("clerkId", clerkId)]
    );
    if (u.total === 0) {
      console.log(`Creating new user for clerkId: ${clerkId}`);
      const doc = await db.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DB_ID,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
        ID.unique(),
        {
          clerkId,
          month,
          usageCount: 0,
          mode: "",
          activeNoteId: "",
        }
      );
      return doc as unknown as UserDoc;
    }
    const doc = u.documents[0] as unknown as UserDoc;
    const updates: Partial<UserDoc> = {};
    if (!("mode" in doc)) updates.mode = "";
    if (!("activeNoteId" in doc)) updates.activeNoteId = "";
    if (doc.month !== month) {
      updates.month = month;
      updates.usageCount = 0;
      updates.mode = "";
      updates.activeNoteId = "";
    }
    if (Object.keys(updates).length > 0) {
      console.log(`Updating user ${clerkId} with: ${JSON.stringify(updates)}`);
      const updatedDoc = await db.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DB_ID,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
        doc.$id,
        updates
      );
      return updatedDoc as unknown as UserDoc;
    }
    return doc;
  } catch (e) {
    console.error(`upsertUser error: ${(e as Error).message}`);
    return null;
  }
}

async function finishSessions(clerkId: string): Promise<void> {
  try {
    const s = await db.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DB_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_SESSIONS_COLLECTION_ID!,
      [Query.equal("clerkId", clerkId), Query.equal("active", true)]
    );
    for (const doc of s.documents) {
      await db.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DB_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_SESSIONS_COLLECTION_ID!,
        doc.$id,
        { active: false }
      );
    }
    console.log(`Finished sessions for user ${clerkId}`);
  } catch (e) {
    console.error(`finishSessions error: ${(e as Error).message}`);
  }
}

async function createSession(
  clerkId: string,
  context: string
): Promise<SessionDoc | null> {
  try {
    const doc = await db.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DB_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_SESSIONS_COLLECTION_ID!,
      ID.unique(),
      { clerkId, active: true, context }
    );
    console.log(`Created session ${doc.$id} for user ${clerkId}`);
    return doc as unknown as SessionDoc;
  } catch (e) {
    console.error(`createSession error: ${(e as Error).message}`);
    return null;
  }
}

async function getActive(clerkId: string): Promise<SessionDoc | null> {
  try {
    const s = await db.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DB_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_SESSIONS_COLLECTION_ID!,
      [Query.equal("clerkId", clerkId), Query.equal("active", true)]
    );
    if (s.total > 0) return s.documents[0] as unknown as SessionDoc;
    return await createSession(clerkId, "");
  } catch (e) {
    console.error(`getActive error: ${(e as Error).message}`);
    return null;
  }
}

async function saveChat(
  sessionId: string,
  clerkId: string,
  role: string,
  content: string
): Promise<void> {
  try {
    const doc = await db.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DB_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_CHATS_COLLECTION_ID!,
      ID.unique(),
      { sessionId, clerkId, role, content }
    );
    console.log(`Saved chat for session ${sessionId}, docId: ${doc.$id}`);
  } catch (e) {
    console.error(`saveChat error: ${(e as Error).message}`);
    throw e;
  }
}

async function chatsSession(
  sessionId: string,
  limit: number
): Promise<ChatDoc[]> {
  try {
    const c = await db.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DB_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_CHATS_COLLECTION_ID!,
      [
        Query.equal("sessionId", sessionId),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
      ]
    );
    return c.documents.map((doc) => doc as unknown as ChatDoc).reverse();
  } catch (e) {
    console.error(`chatsSession error: ${(e as Error).message}`);
    return [];
  }
}

async function chatsUser(clerkId: string, limit: number): Promise<ChatDoc[]> {
  try {
    const c = await db.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DB_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_CHATS_COLLECTION_ID!,
      [
        Query.equal("clerkId", clerkId),
        Query.orderDesc("$createdAt"),
        Query.limit(limit),
      ]
    );
    return c.documents.map((doc) => doc as unknown as ChatDoc).reverse();
  } catch (e) {
    console.error(`chatsUser error: ${(e as Error).message}`);
    return [];
  }
}

async function createNote(clerkId: string): Promise<NoteDoc | null> {
  try {
    const doc = await db.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DB_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!,
      ID.unique(),
      { clerkId, createdAt: new Date().toISOString(), active: true }
    );
    console.log(`Created note ${doc.$id} for user ${clerkId}`);
    return doc as unknown as NoteDoc;
  } catch (e) {
    console.error(`createNote error: ${(e as Error).message}`);
    return null;
  }
}

async function finishNote(clerkId: string): Promise<void> {
  try {
    const userState = await getUserState(clerkId);
    if (userState && userState.activeNoteId) {
      await db.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DB_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_NOTES_COLLECTION_ID!,
        userState.activeNoteId,
        { active: false }
      );
      await setUserState(clerkId, "", "");
      console.log(
        `Finished note ${userState.activeNoteId} for user ${clerkId}`
      );
    }
  } catch (e) {
    console.error(`finishNote error: ${(e as Error).message}`);
  }
}

async function getFullNoteText(noteId: string): Promise<string> {
  try {
    const chunks = await db.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DB_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_NOTE_CHUNKS_COLLECTION_ID!,
      [Query.equal("noteId", noteId), Query.orderAsc("$createdAt")]
    );
    const fullText = chunks.documents
      .map((chunk) => (chunk as unknown as NoteChunkDoc).content)
      .join(" ");
    console.log(
      `Retrieved ${chunks.documents.length} chunks for note ${noteId}, full text: "${fullText}"`
    );
    return fullText;
  } catch (e) {
    console.error(`getFullNoteText error: ${(e as Error).message}`);
    return "";
  }
}

async function setUserState(
  clerkId: string,
  mode: string,
  activeNoteId: string
): Promise<void> {
  try {
    const userDoc = await db.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DB_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
      [Query.equal("clerkId", clerkId)]
    );
    if (userDoc.total === 0) throw new Error(`User ${clerkId} not found`);
    await db.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DB_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
      userDoc.documents[0].$id,
      { mode, activeNoteId }
    );
    console.log(
      `Set user state for ${clerkId}: mode=${mode}, activeNoteId=${activeNoteId}`
    );
  } catch (e) {
    console.error(`setUserState error: ${(e as Error).message}`);
  }
}

async function getUserState(clerkId: string): Promise<UserDoc | null> {
  try {
    const userDoc = await db.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DB_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
      [Query.equal("clerkId", clerkId)]
    );
    if (userDoc.total === 0) return null;
    return userDoc.documents[0] as unknown as UserDoc;
  } catch (e) {
    console.error(`getUserState error: ${(e as Error).message}`);
    return null;
  }
}

async function createWordDocument(
  chats: ChatDoc[],
  clerkId: string
): Promise<Buffer> {
  try {
    const doc = new Document({
      creator: clerkId,
      title: `Chat Session Export - ${clerkId}`,
      description: "Exported chat session from chatbot application",
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: "Chat Session Export",
              heading: HeadingLevel.TITLE,
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: `Exported on: ${new Date().toLocaleString("fa-IR")}`,
              spacing: { after: 200 },
            }),
            new Paragraph({
              text: `User ID: ${clerkId}`,
              spacing: { after: 400 },
            }),
            ...chats.flatMap((chat) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${chat.role === "user" ? "کاربر" : "دستیار"}: `,
                    bold: true,
                    font: "Calibri",
                  }),
                  new TextRun({
                    text: chat.content,
                    font: "Calibri",
                  }),
                ],
                spacing: { after: 100 },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Time: ${new Date(chat.$createdAt).toLocaleString(
                      "fa-IR"
                    )}`,
                    italics: true,
                    size: 20, // Smaller font size for timestamp
                    font: "Calibri",
                  }),
                ],
                spacing: { after: 200 },
              }),
            ]),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    console.log(
      `Created Word document for user ${clerkId}, size: ${buffer.length} bytes`
    );
    return buffer;
  } catch (e) {
    console.error(`createWordDocument error: ${(e as Error).message}`);
    throw new Error(`Failed to create Word document: ${(e as Error).message}`);
  }
}

function menu() {
  return [
    [
      { text: "✨ چت جدید", callback_data: "/newchat" },
      { text: "📝 ساخت یادداشت جدید", callback_data: "/makenote" },
    ],
    [
      {
        text: "🔴 لطفاً کانال یوتیوب را دنبال کنید",
        callback_data: "/youtube",
      },
    ],
    [
      { text: "📜 خلاصه ۱۰۰ پیام", callback_data: "/summary100" },
      { text: "📚 خلاصه همه پیام‌ها", callback_data: "/summaryall" },
    ],
    [{ text: "ℹ️ راهنما", callback_data: "/help" }],
  ];
}

function noteMenu() {
  return [
    [
      { text: "📝 ادامه یادداشت", callback_data: "resume_note" },
      { text: "📋 کپی متن", callback_data: "copy_note" },
    ],
    [
      { text: "📄 وارد کردن به ورد 📝", callback_data: "export_to_word" },
      { text: "🔙 بازگشت به منوی اصلی", callback_data: "back_to_menu" },
    ],
    [{ text: "📝 ساخت یادداشت جدید دیگر", callback_data: "make_new_note" }],
  ];
}
