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
        const samplePayload = {
          update_id: 123456789,
          message: {
            chat: {
              id: 5778138239, // Replace with your actual chat ID
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

        const text = await res.text();
        setResponse(`Status: ${res.status} ${res.statusText}\n\n${text}`);
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
