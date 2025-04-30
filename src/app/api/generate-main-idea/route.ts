import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { FormData } from "@/types/formData";

import { db } from "@/utils/appwrite";
import { auth } from "@clerk/nextjs/server";
import { ID, Query } from "appwrite";

const openai = new OpenAI({
  apiKey: process.env.AVALAI_API_KEY,
  baseURL: "https://api.avalai.ir/v1",
});

const DATABASE_ID = "67eaf6a0002147077712";
const COLLECTION_ID = "67eaf6e000209cd8f310";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "لطفاً ابتدا وارد شوید." },
        { status: 401 }
      );
    }

    const formData: FormData = await request.json();
    const today = new Date().toISOString().split("T")[0]; // e.g., "2025-04-06"

    // Check daily usage limit (4 requests per day)
    const documents = await db.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("userId", userId),
      Query.equal("date", today),
    ]);
    const dailyRequestCount = documents.total;

    if (dailyRequestCount >= 4) {
      return NextResponse.json(
        {
          error: "حد مجاز 4 درخواست روزانه برای این کاربر به پایان رسیده است.",
        },
        { status: 429 }
      );
    }

    // Generate content if under daily limit
    const prompt = `
      شما یک کپی‌رایتر حرفه‌ای هستید. بر اساس اطلاعات زیر، 3 ایده اصلی جذاب و خلاقانه برای محتوای کپی‌رایتینگ پیشنهاد دهید که:
      - با صدای برند (${formData.brandVoice}) هماهنگ باشد
      - احساس ${formData.emotion} را منتقل کند
      - به هدف کمپین (${formData.campaignGoal}) کمک کند
      - متناسب با کانال بازاریابی (${formData.marketingChannel}) باشد
      اطلاعات کمپین:\n${JSON.stringify(formData, null, 2)}
      لطفاً ایده‌ها را به صورت لیست کوتاه و واضح ارائه دهید.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const ideas =
      response.choices[0].message.content?.split("\n").filter(Boolean) || [];

    // Create a new document for this request
    await db.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      {
        userId, // Store userId as an attribute
        date: today, // Store today's date
        count: dailyRequestCount + 1, // Incremental count for today
      },
      ['read("any")']
    );

    return NextResponse.json(ideas, { status: 200 });
  } catch (error) {
    console.error("Error generating main ideas:", error);
    return NextResponse.json(
      { error: "خطا در تولید ایده‌ها" },
      { status: 500 }
    );
  }
}
