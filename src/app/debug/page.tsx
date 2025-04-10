// app/debug/page.tsx
"use client";

import { useState, useEffect } from "react";

export default function DebugPage() {
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDebugData = async () => {
      try {
        // Sample Telegram update payload (e.g., /start command)
        const samplePayload = {
          update_id: 5778138239,
          message: {
            chat: {
              id: 987654321, // Replace with your Telegram chat ID if you have one
              type: "private",
            },
            text: "/start",
          },
        };

        const res = await fetch("/api/telegram", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(samplePayload),
        });

        const data = await res.json();
        setResponse(JSON.stringify(data, null, 2)); // Pretty-print JSON
      } catch (e) {
        setError(`Error: ${String(e)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDebugData();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Debug Telegram API</h1>
      <p>
        This page calls <code>/api/telegram</code> with a sample payload.
      </p>

      {loading && <p>Loading...</p>}
      {response && (
        <div>
          <h2>Response:</h2>
          <pre
            style={{
              background: "#f0f0f0",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            {response}
          </pre>
        </div>
      )}
      {error && (
        <div>
          <h2>Error:</h2>
          <p style={{ color: "red" }}>{error}</p>
        </div>
      )}
    </div>
  );
}
