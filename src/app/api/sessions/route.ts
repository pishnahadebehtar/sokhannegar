import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db, Query } from "../../../utils/appwrite";
import { SessionDoc, ChatDoc } from "../../../types/types";

// GET /api/sessions
// Fetches all chat sessions for the authenticated user with the first user prompt
export async function GET() {
  try {
    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      console.error("GET /api/sessions: No user authenticated");
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
      console.error("GET /api/sessions: Missing environment variables", {
        dbId,
        sessionsCollectionId,
        chatsCollectionId,
      });
      return NextResponse.json(
        { message: "پیکربندی سرور ناقص است." },
        { status: 500 }
      );
    }

    // Fetch all sessions for the user
    const sessionResponse = await db.listDocuments(dbId, sessionsCollectionId, [
      Query.equal("clerkId", userId),
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ]);

    const sessionDocs = sessionResponse.documents as unknown as SessionDoc[];

    // Fetch the first user prompt for each session
    const sessionsWithPrompts = await Promise.all(
      sessionDocs.map(async (session) => {
        const chatResponse = await db.listDocuments(dbId, chatsCollectionId, [
          Query.equal("sessionId", session.$id),
          Query.equal("role", "user"),
          Query.orderAsc("$createdAt"),
          Query.limit(1),
        ]);

        const firstChat = chatResponse.documents[0] as unknown as ChatDoc;
        const firstPrompt = firstChat?.content
          ? firstChat.content.length > 50
            ? firstChat.content.slice(0, 50) + "..."
            : firstChat.content
          : "بدون پیام کاربر";

        return {
          sessionId: session.$id,
          createdAt: session.$createdAt,
          firstPrompt,
        };
      })
    );

    console.log(
      `GET /api/sessions: Fetched ${sessionsWithPrompts.length} sessions for user ${userId}`
    );
    return NextResponse.json({ sessions: sessionsWithPrompts });
  } catch (e) {
    console.error("GET /api/sessions: Failed to fetch sessions:", e);
    return NextResponse.json(
      { message: `خطا در بارگذاری جلسات: ${(e as Error).message}` },
      { status: 500 }
    );
  }
}
