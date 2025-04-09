import { NextRequest, NextResponse } from "next/server";

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_API!;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY!;

/********** Types for Telegram API ***********/
interface TelegramMessage {
  chat: { id: number | string };
  text?: string;
}

interface TelegramUpdate {
  message?: TelegramMessage;
}

interface ReplyKeyboardMarkup {
  keyboard: Array<Array<{ text: string }>>;
  resize_keyboard?: boolean;
  one_time_keyboard?: boolean;
  selective?: boolean;
}

interface TelegramRequest {
  chat_id: number | string;
  text: string;
  parse_mode: "Markdown";
  reply_markup?: ReplyKeyboardMarkup;
}

interface OpenRouterRes {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const data: TelegramUpdate = await req.json();
  if (!data.message) return NextResponse.json({ status: "ok" });

  const chatId = data.message.chat.id;
  const text = (data.message.text || "").trim();

  console.log("Received message:", text);

  switch (true) {
    case /^\/start/i.test(text):
      await sendTelegram(
        chatId,
        "سلام! به ربات هوش مصنوعی خوش آمدید. یکی از گزینه‌ها را انتخاب کنید 👇",
        mainMenu()
      );
      break;

    case /^\/newchat/i.test(text):
      await sendTelegram(
        chatId,
        "شروع چت جدید! لطفا پیام خود را ارسال کنید.",
        mainMenu()
      );
      break;

    case /^\/summary100/i.test(text):
      await sendTelegram(
        chatId,
        "خلاصه ۱۰۰ پیام آخر (در حال توسعه)",
        mainMenu()
      );
      break;

    case /^\/summaryall/i.test(text):
      await sendTelegram(chatId, "خلاصه کل گفت‌وگو (در حال توسعه)", mainMenu());
      break;

    case /^\/youtube/i.test(text):
      await sendTelegram(
        chatId,
        "کانال ما:\nhttps://t.me/sokhannegar_bot",
        mainMenu()
      );
      break;

    case /^\/help/i.test(text):
      await sendTelegram(
        chatId,
        "راهنما:\n" +
          "/start - شروع یا ریستارت گفتگو\n" +
          "/newchat - آغاز گفتگوی جدید\n" +
          "/summary100 - خلاصه ۱۰۰ پیام اخیر\n" +
          "/summaryall - خلاصه کل گفتگو\n" +
          "/youtube - کانال ما",
        mainMenu()
      );
      break;

    default:
      const aiText = await askOpenRouterAI(text);
      await sendTelegram(chatId, aiText, mainMenu());
      break;
  }

  return NextResponse.json({ status: "ok" });
}

async function sendTelegram(
  chatId: number | string,
  text: string,
  replyMarkup?: ReplyKeyboardMarkup
): Promise<void> {
  const body: TelegramRequest = {
    chat_id: chatId,
    text: text,
    parse_mode: "Markdown",
  };
  if (replyMarkup) body.reply_markup = replyMarkup;

  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function askOpenRouterAI(prompt: string): Promise<string> {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    const data: OpenRouterRes = await response.json();
    return (
      data.choices?.[0]?.message?.content?.trim() ?? "متاسفم، پاسخی دریافت نشد."
    );
  } catch (error) {
    console.error("OpenRouter error:", error);
    return "خطا در دریافت پاسخ.";
  }
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
