import { NextRequest, NextResponse } from "next/server";
import { db, ID } from "@/utils/appwrite";
import { ChatResponse, Button } from "@/types/types";
import { readFileSync, writeFileSync, unlinkSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { OpenAI } from "openai";

// Initialize AvalAI client
const openai = new OpenAI({
  apiKey: process.env.AVALAI_API_KEY,
  baseURL: "https://api.avalai.ir/v1",
});

// Environment variables
const IOTYPE_API_TOKEN = process.env.IOTYPE_API_TOKEN;
const APPWRITE_DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DB_ID;
const APPWRITE_CHATS_COLLECTION =
  process.env.NEXT_PUBLIC_APPWRITE_CHATS_COLLECTION_ID;
const IOTYPE_TRANSCRIPTION_URL =
  "https://www.iotype.com/developer/transcription";

// Menu function (same as in Chat component)
function menu(): Button[][] {
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

// Helper function to transcribe a single audio file with retries
async function transcribeAudio(
  audioPath: string,
  chunkName: string
): Promise<string> {
  const maxRetries = 3;
  let attempt = 1;
  let transcription = "";

  while (attempt <= maxRetries && transcription === "") {
    console.log(`Attempt ${attempt} for IoType transcription of ${chunkName}`);
    try {
      const audioBuffer = readFileSync(audioPath);
      console.log(
        `Read audio file: ${audioPath}, size: ${audioBuffer.length} bytes`
      );

      if (audioBuffer.length === 0) {
        throw new Error(`Audio file is empty: ${audioPath}`);
      }
      if (audioBuffer.length > 3 * 1024 * 1024) {
        throw new Error(
          `Audio file size exceeds 3MB: ${audioBuffer.length} bytes`
        );
      }

      const formData = new FormData();
      formData.append("type", "file");
      formData.append(
        "file",
        new Blob([audioBuffer], { type: "audio/wav" }),
        "audio.wav"
      );

      const response = await fetch(IOTYPE_TRANSCRIPTION_URL, {
        method: "POST",
        headers: {
          Authorization: IOTYPE_API_TOKEN!,
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: formData,
      });

      const responseText = await response.text();
      console.log(`IoType response for ${audioPath}:`, responseText);

      if (!response.ok) {
        throw new Error(
          `IoType API request failed: ${response.status} ${responseText}`
        );
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        throw new Error(`Failed to parse IoType response: ${err}`);
      }

      if (data.status !== 100) {
        throw new Error(
          data.message || `IoType API error: Status ${data.status}`
        );
      }

      transcription = data.result || "";
      console.log(
        `Transcription for ${chunkName} (attempt ${attempt}):`,
        transcription
      );

      if (transcription === "" && attempt < maxRetries) {
        console.warn(`Empty transcription for ${chunkName}, retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1-second delay
      }
    } catch (err) {
      console.error(
        `Transcription failed for ${chunkName} on attempt ${attempt}:`,
        err
      );
      if (attempt === maxRetries) {
        console.error(
          `Transcription failed after ${maxRetries} attempts for ${chunkName}`
        );
        return ""; // Return empty string to skip failed chunk
      }
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1-second delay before retry
    }
    attempt++;
  }

  return transcription;
}

// Helper function to correct transcription with AvalAI
async function correctTranscription(transcription: string): Promise<string> {
  try {
    const prompt = `متن زیر یک تبدیل گفتار به متن به زبان فارسی است که ممکن است شامل خطاهای رونویسی باشد چرا که کاربر این متن را به صورت صوتی بیان کرده و یک وب سرویس این متن رو تشخصی داده و نوشته. لطفاً متن را بررسی کنید و اگر معنی‌دار نیست، کلمات یا عباراتی که به اشتباه رونویسی شده‌اند و باعث بی‌معنی شدن متن می‌شوند را با کلمات مناسب جایگزین کنید تا متن کاملاً معنی‌دار و روان شوداما از خودت اضافه تر ملطبی بیان نکن مثلا جواب پرسشی که در متن هست رو نباید بدی بلکه فقط باید مطمئن بشی متن خروجی تو کاملا با معنی و مفهوم هستش نه اینکه به ادامه متن چیزی از خودت اضافه کنی یا بخوای بحث کنی راجع بهش. خروجی باید به فارسی و حداکثر ۱۵۰۰ کاراکتر باشد. متن اصلی:\n${transcription}\n\nپاسخ: `;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 600,
    });
    console.log(
      `AvalAI correction response: ${JSON.stringify(response).slice(0, 100)}...`
    );
    return response.choices[0].message.content || transcription;
  } catch (e) {
    console.error(`AvalAI correction error: ${(e as Error).message}`);
    return transcription; // Fallback to original transcription on error
  }
}

export async function POST(request: NextRequest) {
  const tempFilePaths: string[] = [];

  try {
    // Validate environment variables
    if (
      !IOTYPE_API_TOKEN ||
      !APPWRITE_DB_ID ||
      !APPWRITE_CHATS_COLLECTION ||
      !process.env.AVALAI_API_KEY
    ) {
      console.error("Missing environment variables:", {
        IOTYPE_API_TOKEN: !!IOTYPE_API_TOKEN,
        APPWRITE_DB_ID: !!APPWRITE_DB_ID,
        APPWRITE_CHATS_COLLECTION: !!APPWRITE_CHATS_COLLECTION,
        AVALAI_API_KEY: !!process.env.AVALAI_API_KEY,
      });
      throw new Error("Server configuration error");
    }

    // Parse FormData from request
    const formData = await request.formData();
    console.log(
      "FormData entries:",
      Array.from(formData.entries()).map(([key, value]) => ({
        key,
        value:
          value instanceof File
            ? { name: value.name, size: value.size, type: value.type }
            : value,
      }))
    );

    const chunks = formData.getAll("chunks") as File[];
    const clerkId = formData.get("clerkId") as string | null;
    const sessionId = formData.get("sessionId") as string | null;

    // Validate inputs
    if (!chunks || chunks.length === 0 || !clerkId || !sessionId) {
      console.error("Invalid inputs:", {
        chunkCount: chunks?.length,
        clerkId,
        sessionId,
      });
      throw new Error("Missing chunks, clerkId, or sessionId");
    }

    // Validate chunk sizes and types
    for (const chunk of chunks) {
      console.log("Received chunk:", {
        name: chunk.name,
        size: chunk.size,
        type: chunk.type,
      });
      if (chunk.size > 3 * 1024 * 1024) {
        console.error(`Chunk size exceeds 3MB: ${chunk.size} bytes`);
        throw new Error("Chunk size exceeds 3MB limit");
      }
      if (!chunk.type.startsWith("audio/")) {
        console.error(`Invalid chunk type: ${chunk.type}`);
        throw new Error("Only audio files are supported");
      }
    }

    // Save chunks to temporary files and prepare for parallel processing
    const chunkTasks = chunks.map(async (chunk, index) => {
      const tempFilePath = join(tmpdir(), `chunk_${Date.now()}_${chunk.name}`);
      try {
        const chunkBuffer = Buffer.from(await chunk.arrayBuffer());
        writeFileSync(tempFilePath, chunkBuffer);
        console.log(
          `Saved temporary file: ${tempFilePath}, size: ${chunkBuffer.length} bytes`
        );
        tempFilePaths.push(tempFilePath);
        return { tempFilePath, chunkName: chunk.name, index };
      } catch (err) {
        console.error(`Failed to save temporary file ${tempFilePath}:`, err);
        throw new Error(`Failed to save audio chunk: ${err}`);
      }
    });

    const savedChunks = await Promise.all(chunkTasks);

    // Transcribe all chunks in parallel
    const transcriptionTasks = savedChunks.map(
      ({ tempFilePath, chunkName, index }) =>
        transcribeAudio(tempFilePath, chunkName).then((transcription) => ({
          transcription,
          index,
        }))
    );

    const transcriptions = await Promise.all(transcriptionTasks);

    // Sort transcriptions by chunk index to maintain order
    const sortedTranscriptions = transcriptions
      .sort((a, b) => a.index - b.index)
      .map((t) => t.transcription)
      .filter((t) => t.trim() !== "");

    console.log("All transcriptions:", sortedTranscriptions);

    // Combine transcriptions
    const combinedTranscription = sortedTranscriptions.join(" ").trim();
    if (!combinedTranscription) {
      console.error("No valid transcriptions received");
      throw new Error("No valid transcriptions received");
    }
    console.log("Combined transcription:", combinedTranscription);

    // Correct transcription with AvalAI
    const correctedTranscription = await correctTranscription(
      combinedTranscription
    );
    console.log("Corrected transcription:", correctedTranscription);

    // Save corrected transcription to Appwrite
    try {
      await db.createDocument(
        APPWRITE_DB_ID,
        APPWRITE_CHATS_COLLECTION,
        ID.unique(),
        {
          sessionId,
          role: "assistant",
          content: correctedTranscription,
          clerkId,
        }
      );
      console.log("Saved corrected transcription to Appwrite");
    } catch (err) {
      console.error("Appwrite save failed:", err);
      throw new Error(`Failed to save transcription to database: ${err}`);
    }

    // Prepare response for the chat UI
    const chatResponse: ChatResponse = {
      message: correctedTranscription || "No transcription available",
      buttons: menu(),
    };

    return NextResponse.json(chatResponse, { status: 200 });
  } catch (error) {
    console.error("Voice API error:", error);
    const errorMessage = (error as Error).message || "Failed to process voice";
    const chatResponse: ChatResponse = {
      message: `🚫 خطا: ${errorMessage}`,
    };
    return NextResponse.json(chatResponse, { status: 500 });
  } finally {
    // Clean up temporary files
    for (const tempFilePath of tempFilePaths) {
      if (tempFilePath && existsSync(tempFilePath)) {
        try {
          unlinkSync(tempFilePath);
          console.log(`Deleted temporary file: ${tempFilePath}`);
        } catch (err) {
          console.error(`Failed to delete temp file ${tempFilePath}:`, err);
        }
      }
    }
  }
}
