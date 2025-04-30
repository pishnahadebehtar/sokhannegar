import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db, Query } from "@/utils/appwrite"; // Adjusted import path
import { SessionDoc, ChatDoc } from "@/types/types";

// GET /api/sessions/[sessionId]
// Fetches the entire chat history for a specific session
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> } // Use Promise for params (Next.js 15.x)
) {
  try {
    // Resolve params
    const params = await context.params;
    const { sessionId } = params;
    if (!sessionId) {
      console.error("GET /api/sessions/[sessionId]: Missing sessionId");
      return NextResponse.json(
        { message: "شناسه جلسه مورد نیاز است." },
        { status: 400 }
      );
    }

    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      console.error(`GET /api/sessions/${sessionId}: No user authenticated`);
      return NextResponse.json(
        { message: "لطفاً ابتدا وارد شوید." },
        { status: 401 }
      );
    }

    // Validate environment variables
    const dbId = process.env.NEXT_PUBLIC_APPWRITE_DB_ID;
    const sessionsCollectionId =
      process.env.NEXT_PUBLIC_APPWRITE_SESSIONS_COLLECTION_ID;
    const chatsCollectionId =
      process.env.NEXT_PUBLIC_APPWRITE_CHATS_COLLECTION_ID;

    if (!dbId || !sessionsCollectionId || !chatsCollectionId) {
      console.error(
        `GET /api/sessions/${sessionId}: Missing environment variables`,
        {
          dbId,
          sessionsCollectionId,
          chatsCollectionId,
        }
      );
      return NextResponse.json(
        { message: "پیکربندی سرور ناقص است." },
        { status: 500 }
      );
    }

    // Verify the session belongs to the user
    const sessionResponse = await db.getDocument(
      dbId,
      sessionsCollectionId,
      sessionId
    );

    const session = sessionResponse as unknown as SessionDoc;
    if (session.clerkId !== userId) {
      console.error(
        `GET /api/sessions/${sessionId}: Unauthorized access by user ${userId}`
      );
      return NextResponse.json(
        { message: "دسترسی غیرمجاز به جلسه." },
        { status: 403 }
      );
    }

    // Fetch all messages for the session
    const chatResponse = await db.listDocuments(dbId, chatsCollectionId, [
      Query.equal("sessionId", sessionId),
      Query.orderAsc("$createdAt"),
      Query.limit(1000),
    ]);

    const messages = chatResponse.documents.map((doc) => ({
      role: (doc as unknown as ChatDoc).role,
      content: (doc as unknown as ChatDoc).content,
    }));

    console.log(
      `GET /api/sessions/${sessionId}: Fetched ${messages.length} messages for user ${userId}`
    );
    return NextResponse.json({ sessionId, messages });
  } catch (e) {
    const sessionId = (await context.params)?.sessionId || "unknown";
    console.error(
      `GET /api/sessions/${sessionId}: Failed to fetch session:`,
      e
    );
    return NextResponse.json(
      { message: `خطا در بارگذاری تاریخچه چت: ${(e as Error).message}` },
      { status: 500 }
    );
  }
}
