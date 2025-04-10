// app/api/telegram/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming Telegram update
    let body;
    try {
      body = await req.json();
      console.log(`Received Telegram update: ${JSON.stringify(body)}`);
    } catch (parseError) {
      console.error(`Failed to parse request body: ${String(parseError)}`);
      return NextResponse.json(
        { status: "error", message: `Parse error: ${String(parseError)}` },
        { status: 400 }
      );
    }

    const message = body.message;
    if (!message) {
      console.log("No message in update");
      return NextResponse.json({
        status: "ok",
        message: "No message to process",
      });
    }

    const chatId = message.chat?.id?.toString();
    if (!chatId) {
      console.error("No chat ID in message");
      return NextResponse.json(
        { status: "error", message: "Missing chat ID" },
        { status: 400 }
      );
    }

    const text = (message.text || "").trim();
    console.log(`Processing chat ${chatId}: "${text}"`);

    // Handle /start command
    if (/^\/start/i.test(text)) {
      console.log("Handling /start command");
      await sendTelegramMessage(
        chatId,
        "🌟 Hello! Send a message or choose an option",
        menu()
      );
      return NextResponse.json({ status: "ok" });
    }

    return NextResponse.json({ status: "ok", message: "Command not handled" });
  } catch (error) {
    console.error(`API error: ${String(error)}`);
    return NextResponse.json(
      { status: "error", message: `Server error: ${String(error)}` },
      { status: 500 }
    );
  }
}

async function sendTelegramMessage(
  chatId: string,
  text: string,
  reply_markup?: { keyboard: { text: string }[][]; resize_keyboard: boolean }
) {
  const TELEGRAM_TOKEN =
    process.env.TELEGRAM_TOKEN ||
    "7797121309:AAHETVcA0lSWjEvw0YjB4Dz9zwcUvI3LcxE";
  try {
    const requestBody = {
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
      reply_markup,
    };
    console.log(`Sending to Telegram: ${JSON.stringify(requestBody)}`);
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );
    const responseText = await response.text();
    console.log(`Telegram response: ${response.status} - ${responseText}`);
    if (!response.ok) {
      throw new Error(`Telegram API error: ${responseText}`);
    }
  } catch (error) {
    console.error(`Telegram send error: ${String(error)}`);
    throw error;
  }
}

function menu() {
  return {
    keyboard: [
      [{ text: "🌱 Start New Chat" }, { text: "📺 Follow on YouTube" }],
      [{ text: "📝 Summarize 100" }, { text: "📜 Summarize All" }],
      [{ text: "❓ Help" }],
    ],
    resize_keyboard: true,
  };
}
