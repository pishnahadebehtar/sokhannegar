import { Client, Databases, ID, Query } from "appwrite";

// Initialize Appwrite client for client-side use
const client = new Client();

if (
  !process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
  !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
) {
  console.error(
    "Appwrite environment variables are missing. Please check your .env.local file."
  );
  throw new Error("Appwrite configuration is incomplete.");
}

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

export const db = new Databases(client);
export { ID, Query };
