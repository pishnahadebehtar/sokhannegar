// app/api/telegram-webhook/route.ts

import { NextRequest, NextResponse } from "next/server";

const TELEGRAM_TOKEN = "7797121309:AAHETVcA0lSWjEvw0YjB4Dz9zwcUvI3LcxE";

export async function POST(req: NextRequest) {
  const data = await req.json();

  console.log("Telegram update:", JSON.stringify(data, null, 2));

  // If incoming update contains a message
  if (data.message && data.message.text) {
    const chatId = data.message.chat.id;
    const text = data.message.text;

    // When user sends "/start"
    if (text === "/start") {
      await sendTelegramMessage(
        chatId,
        "سلام! به ربات هوش مصنوعی خوش آمدید. لطفاً یکی از دکمه‌ها را انتخاب کنید."
      );
    } else {
      // Echo other text
      await sendTelegramMessage(chatId, `شما نوشتید:\n${text}`);
    }
  }

  return NextResponse.json({ status: "ok" });
}

async function sendTelegramMessage(chatId: number | string, text: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "Markdown",
    }),
  });
}
