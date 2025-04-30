import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { FormData } from "@/types/formData";
import { db } from "@/utils/appwrite";
import { auth } from "@clerk/nextjs/server";
import { ID, Query } from "appwrite";
import { channelInstructions } from "@/constants/promptInstructions";

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
    const today = new Date().toISOString().split("T")[0];

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
    const channelInstruction =
      channelInstructions[formData.marketingChannel] || "";
    const prompt = `
      شما یک کپی‌رایتر حرفه‌ای هستید که در تولید محتوای جذاب و مؤثر تخصص دارید. بر اساس اطلاعات زیر، یک محتوای کپی‌رایتینگ باکیفیت بالا تولید کنید:
      - اطلاعات کمپین: ${JSON.stringify(formData, null, 2)}
      - دستورالعمل کانال: ${channelInstruction}
      لطفاً محتوا را به زبان فارسی بنویسید و مطمئن شوید که:
      - لحن با صدای برند (${formData.brandVoice}) سازگار باشد
      - احساس ${formData.emotion} به وضوح منتقل شود
      - به هدف کمپین (${formData.campaignGoal}) دست یابد
      - نقاط درد (${formData.customerPains.join(
        ", "
      )}) و خواسته‌ها (${formData.customerDesires.join(", ")}) را در نظر بگیرد
      - از کلمات کلیدی (${formData.keywords.join(
        ", "
      )}) به طور طبیعی استفاده کند
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const copy = response.choices[0].message.content || "";

    // Create a new document for this request
    await db.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      {
        userId,
        date: today,
        count: dailyRequestCount + 1,
      },
      ['read("any")']
    );

    return NextResponse.json({ prompt, copy }, { status: 200 });
  } catch (error) {
    console.error("Error generating copy:", error);
    return NextResponse.json({ error: "خطا در تولید کپی" }, { status: 500 });
  }
}
