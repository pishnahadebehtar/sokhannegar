import { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface Session {
  sessionId: string;
  createdAt: string;
  firstPrompt: string;
}

interface ChatListProps {
  clerkId: string;
  onSessionSelect: (sessionId: string) => void;
}

export default function ChatList({ clerkId, onSessionSelect }: ChatListProps) {
  const theme = useTheme();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch("/api/sessions", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch sessions");
        }

        const data = await response.json();
        setSessions(data.sessions);
      } catch (e) {
        console.error("Failed to fetch chat sessions:", e);
        setError("خطا در بارگذاری تاریخچه چت‌ها");
      } finally {
        setLoading(false);
      }
    };

    if (clerkId) {
      fetchSessions();
    }
  }, [clerkId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", color: "error.main", p: 2 }}>
        <Typography variant="body1">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.paper,
        borderRadius: "15px",
        boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.5)",
        maxHeight: "50vh",
        overflowY: "auto",
        p: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
        تاریخچه چت‌ها
      </Typography>
      <List>
        {sessions.length === 0 ? (
          <Typography variant="body2" sx={{ textAlign: "center" }}>
            هیچ چت‌ای یافت نشد.
          </Typography>
        ) : (
          sessions.map((session, index) => (
            <Box key={session.sessionId}>
              <ListItem
                onClick={() => onSessionSelect(session.sessionId)}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: theme.palette.primary.main,
                    color: "#000",
                  },
                  borderRadius: "10px",
                  mb: 1,
                }}
              >
                <ListItemText
                  primary={session.firstPrompt}
                  secondary={new Date(session.createdAt).toLocaleString(
                    "fa-IR"
                  )}
                />
              </ListItem>
              {index < sessions.length - 1 && <Divider />}
            </Box>
          ))
        )}
      </List>
    </Box>
  );
}
