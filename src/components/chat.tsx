"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { db, ID, Query } from "../utils/appwrite";
import { ChatDoc } from "../types/types";
import {
  ThemeProvider,
  createTheme,
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  CircularProgress,
  Switch,
  FormControlLabel,
  Input,
  Collapse,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MicIcon from "@mui/icons-material/Mic";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import HistoryIcon from "@mui/icons-material/History";
import MicRecorder from "mic-recorder-to-mp3";
import { keyframes } from "@mui/system";
import toWav from "audiobuffer-to-wav";
import ChatList from "./ChatList";

interface Message {
  role: string;
  content: string;
}

interface Button {
  text: string;
  callback_data: string;
}

interface ChatResponse {
  message: string;
  buttons?: Button[][];
}

const heartbeat = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

const theme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#0A0E1A", paper: "#1A1F33" },
    primary: { main: "#FFD700" },
    secondary: { main: "#4B5EAA" },
    text: { primary: "#E6E6FA" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "20px",
          padding: "10px 20px",
          boxShadow:
            "0 4px 6px rgba(0, 0, 0, 0.3), inset 0 0 10px rgba(255, 215, 0, 0.2)",
          "&:hover": {
            boxShadow:
              "0 6px 12px rgba(0, 0, 0, 0.4), inset 0 0 15px rgba(255, 215, 0, 0.4)",
            backgroundColor: "#E5B800",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "15px",
            backgroundColor: "#2A2F45",
            "& fieldset": { borderColor: "#4B5EAA" },
            "&:hover fieldset": { borderColor: "#FFD700" },
          },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          color: "#4B5EAA",
          "&.Mui-checked": {
            color: "#FFD700",
          },
        },
        track: {
          backgroundColor: "#2A2F45",
          ".Mui-checked + &": {
            backgroundColor: "#E5B800",
          },
        },
      },
    },
  },
  typography: {
    fontFamily: "FarNazanin, sans-serif",
    fontSize: 16,
  },
});

export default function Chat() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAIMode, setIsAIMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MicRecorder | null>(null);

  const envVars = {
    dbId: process.env.NEXT_PUBLIC_APPWRITE_DB_ID,
    sessionsCollection: process.env.NEXT_PUBLIC_APPWRITE_SESSIONS_COLLECTION_ID,
    usersCollection: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID,
    chatsCollection: process.env.NEXT_PUBLIC_APPWRITE_CHATS_COLLECTION_ID,
  };

  useEffect(() => {
    const missingVars = Object.entries(envVars)
      .filter(([, value]) => !value)
      .map(([key]) => key);
    if (missingVars.length > 0) {
      setError(`Missing environment variables: ${missingVars.join(", ")}`);
    }
  }, []);

  useEffect(() => {
    recorderRef.current = new MicRecorder({
      bitRate: 128,
    });
    return () => {
      recorderRef.current = null;
    };
  }, []);

  const splitAudio = async (
    file: File,
    chunkDuration: number
  ): Promise<File[]> => {
    try {
      const audioContext = new AudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const sampleRate = audioBuffer.sampleRate;
      const chunks: File[] = [];
      const numChunks = Math.ceil(audioBuffer.duration / chunkDuration);

      for (let i = 0; i < numChunks; i++) {
        const startTime = i * chunkDuration;
        const endTime = Math.min(
          startTime + chunkDuration,
          audioBuffer.duration
        );
        const startSample = Math.floor(startTime * sampleRate);
        const endSample = Math.floor(endTime * sampleRate);
        const chunkLength = endSample - startSample;

        const chunkBuffer = audioContext.createBuffer(
          audioBuffer.numberOfChannels,
          chunkLength,
          sampleRate
        );

        for (
          let channel = 0;
          channel < audioBuffer.numberOfChannels;
          channel++
        ) {
          const sourceData = audioBuffer
            .getChannelData(channel)
            .slice(startSample, endSample);
          chunkBuffer.copyToChannel(sourceData, channel);
        }

        const wavBuffer = toWav(chunkBuffer);
        const chunkFile = new File(
          [wavBuffer],
          `chunk_${i}_${Date.now()}.wav`,
          { type: "audio/wav" }
        );
        chunks.push(chunkFile);
      }

      return chunks;
    } catch (e) {
      console.error("Error splitting audio:", e);
      throw new Error("Failed to split audio into chunks");
    }
  };

  const initializeSession = useCallback(
    async (clerkId: string) => {
      if (!envVars.dbId || !envVars.sessionsCollection) {
        setError("Appwrite configuration is missing.");
        return null;
      }
      try {
        const sessions = await db.listDocuments(
          envVars.dbId,
          envVars.sessionsCollection,
          [Query.equal("clerkId", clerkId), Query.equal("active", true)]
        );
        let sessId: string;
        if (sessions.total === 0) {
          const newSession = await db.createDocument(
            envVars.dbId,
            envVars.sessionsCollection,
            ID.unique(),
            { clerkId, active: true, context: "" }
          );
          sessId = newSession.$id;
        } else {
          sessId = sessions.documents[0].$id;
        }
        setSessionId(sessId);
        return sessId;
      } catch (e) {
        console.error("Failed to initialize session:", e);
        setError("Failed to initialize session.");
        return null;
      }
    },
    [envVars.dbId, envVars.sessionsCollection]
  );

  const fetchMessages = useCallback(
    async (sessId: string) => {
      if (!envVars.dbId || !envVars.chatsCollection) {
        setError("Appwrite configuration is missing.");
        return;
      }
      try {
        const chats = await db.listDocuments(
          envVars.dbId,
          envVars.chatsCollection,
          [
            Query.equal("sessionId", sessId),
            Query.orderDesc("$createdAt"),
            Query.limit(50),
          ]
        );
        const mappedMessages = chats.documents
          .map((doc) => doc as unknown as ChatDoc)
          .map((doc) => ({
            role: doc.role,
            content: doc.content,
          }))
          .reverse();
        setMessages(mappedMessages);
      } catch (e) {
        console.error("Failed to fetch messages:", e);
        setError("Failed to fetch messages.");
      }
    },
    [envVars.dbId, envVars.chatsCollection]
  );

  const handleSessionSelect = async (selectedSessionId: string) => {
    if (!user?.id) {
      setError("User not authenticated.");
      return;
    }

    setIsLoading(true);
    try {
      console.log(
        `Fetching session history for sessionId: ${selectedSessionId}`
      );
      const response = await fetch(`/api/sessions/${selectedSessionId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      console.log(`Response status: ${response.status}`);
      if (!response.ok) {
        const text = await response.text();
        console.error(`Non-OK response: ${text}`);
        throw new Error(
          `Failed to fetch session history: ${response.status} ${response.statusText}`
        );
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error(`Non-JSON response: ${text}`);
        throw new Error("Received non-JSON response from server");
      }

      const data = await response.json();
      setMessages(data.messages);
      setSessionId(selectedSessionId);
      setShowHistory(false);
    } catch (e) {
      console.error("Failed to fetch session history:", e);
      setError(`خطا در بارگذاری تاریخچه چت: ${(e as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id || error) return;

    const init = async () => {
      try {
        const sessId = await initializeSession(user.id);
        if (sessId) {
          await fetchMessages(sessId);
        }
      } catch (e) {
        console.error("Failed to initialize chat:", e);
        setError("Failed to initialize chat.");
      }
    };

    init();
  }, [user, error, initializeSession, fetchMessages]);

  useEffect(() => {
    const messagesDiv = document.querySelector(".messages");
    if (messagesDiv) {
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user?.id || !sessionId) {
      setError("Missing input or configuration.");
      return;
    }

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      await saveChat(userMessage);
      if (isAIMode) {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clerkId: user.id, text: input, sessionId }),
        });
        const data: ChatResponse = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to get AI response");
        }
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message },
        ]);
      }
    } catch (e) {
      console.error("Failed to send message:", e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `🚫 خطا: ${(e as Error).message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveChat = async (message: Message) => {
    if (!envVars.dbId || !envVars.chatsCollection || !sessionId || !user?.id) {
      throw new Error("Appwrite configuration missing");
    }
    await db.createDocument(
      envVars.dbId,
      envVars.chatsCollection,
      ID.unique(),
      {
        sessionId,
        clerkId: user.id,
        role: message.role,
        content: message.content,
      }
    );
  };

  const handleNewChat = async () => {
    if (!user?.id || !sessionId) {
      setError("Configuration error.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId: user.id, text: "/newchat", sessionId }),
      });
      const data: ChatResponse = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to reset chat");
      }
    } catch (e) {
      console.error("Failed to reset chat:", e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `🚫 خطا: ${(e as Error).message}` },
      ]);
    } finally {
      setMessages([]);
      setSessionId(null);
      const newSessionId = await initializeSession(user.id);
      if (newSessionId) {
        await fetchMessages(newSessionId);
      }
      setIsLoading(false);
    }
  };

  const handleExportToWord = async () => {
    if (!user?.id || !sessionId) {
      setError("Configuration error.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId: user.id,
          text: "export_to_word",
          sessionId,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to export chat to Word");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chat_${user.id}_${Date.now()}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      const systemMessage = {
        role: "assistant",
        content: "📄 چت به فایل ورد صادر شد. فایل را بررسی کنید.",
      };
      setMessages((prev) => [...prev, systemMessage]);
      await saveChat(systemMessage);
    } catch (e) {
      console.error("Failed to export to Word:", e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `🚫 خطا: ${(e as Error).message}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      if (!recorderRef.current) {
        throw new Error("Recorder is not initialized");
      }
      await recorderRef.current.start();
      setIsRecording(true);
    } catch (e) {
      console.error("Recording error:", e);
      setError("دسترسی به میکروفون مجاز نیست یا خطایی رخ داد");
    }
  };

  const stopRecording = async () => {
    try {
      if (!recorderRef.current) {
        throw new Error("Recorder is not initialized");
      }
      const result = await recorderRef.current.stop().getMp3();
      const [, blob] = result;
      setIsRecording(false);
      if (blob) {
        const audioFile = new File([blob], `recording_${Date.now()}.mp3`, {
          type: "audio/mp3",
        });
        await handleVoiceUpload(audioFile);
      } else {
        throw new Error("No audio recorded");
      }
    } catch (e) {
      console.error("Error stopping recording:", e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `🚫 خطا در پردازش صدای ضبط شده` },
      ]);
    }
  };

  const toggleRecorder = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (
      file &&
      file.type.startsWith("audio/") &&
      file.size < 50 * 1024 * 1024
    ) {
      await handleVoiceUpload(file);
    } else {
      setError("لطفاً یک فایل صوتی معتبر (حداکثر 50 مگابایت) انتخاب کنید");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleVoiceUpload = async (file: File) => {
    if (!user?.id || !sessionId) {
      setError("Configuration error.");
      return;
    }

    setIsLoading(true);
    const systemMessage = {
      role: "assistant",
      content: "در حال پردازش فایل صوتی...",
    };
    setMessages((prev) => [...prev, systemMessage]);
    await saveChat(systemMessage);

    try {
      const chunks = await splitAudio(file, 8);
      if (chunks.length === 0) {
        throw new Error("No audio chunks generated");
      }

      const formData = new FormData();
      chunks.forEach((chunk) => {
        formData.append("chunks", chunk);
      });
      formData.append("clerkId", user.id);
      formData.append("sessionId", sessionId);

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

      const response = await fetch("/api/voice", {
        method: "POST",
        body: formData,
      });

      const data: ChatResponse = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to process audio");
      }

      const userMessage = { role: "user", content: data.message };
      setMessages((prev) => [...prev, userMessage]);
      await saveChat(userMessage);

      if (isAIMode) {
        const aiResponse = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerkId: user.id,
            text: data.message,
            sessionId,
          }),
        });
        const aiData: ChatResponse = await aiResponse.json();
        if (!aiResponse.ok) {
          throw new Error(aiData.message || "Failed to get AI response");
        }
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: aiData.message },
        ]);
      }
    } catch (e) {
      console.error("Failed to process voice upload:", e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `🚫 خطا: ${(e as Error).message}` },
      ]);
      await saveChat({
        role: "assistant",
        content: `🚫 خطا: ${(e as Error).message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <Box sx={{ textAlign: "center", color: "error.main", p: 2 }}>
        <Typography variant="h6">{error}</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ textAlign: "center", color: "text.primary", p: 2 }}>
        <Typography variant="h6">لطفاً وارد شوید</Typography>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          maxWidth: "90vw",
          mt: 2,
          mb: 2,
          mx: "auto",
          p: 2,
          bgcolor: "background.default",
          minHeight: "100vh",
          borderRadius: "20px",
          boxShadow: "0 0 20px rgba(255, 215, 0, 0.1)",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h5">چت هوشمند</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<HistoryIcon sx={{ marginLeft: 2 }} />}
            onClick={() => setShowHistory(!showHistory)}
            disabled={isLoading}
            sx={{ minWidth: "150px" }}
          >
            {showHistory ? "مخفی کردن تاریخچه" : "نمایش تاریخچه"}
          </Button>
        </Box>

        <Collapse in={showHistory}>
          <ChatList clerkId={user.id} onSessionSelect={handleSessionSelect} />
        </Collapse>

        <Box
          className="messages"
          sx={{
            maxHeight: "60vh",
            overflowY: "auto",
            mb: 2,
            p: 2,
            bgcolor: "background.paper",
            borderRadius: "15px",
            boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.5)",
          }}
        >
          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                mb: 1,
                p: 2,
                borderRadius: "10px",
                bgcolor:
                  msg.role === "user" ? "primary.main" : "secondary.main",
                maxWidth: "70%",
                ml: msg.role === "user" ? "auto" : "5%",
                mr: msg.role === "user" ? "5%" : "auto",
                color: msg.role === "user" ? "#000000" : "text.primary",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              }}
            >
              <Typography variant="body1">
                <strong>{msg.role === "user" ? "شما" : "دستیار"}:</strong>{" "}
                {msg.content}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="پیام خود را وارد کنید..."
            disabled={isLoading}
            variant="outlined"
          />
          <IconButton
            onClick={handleSend}
            disabled={isLoading}
            color="primary"
            sx={{ ml: 1 }}
          >
            {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
          </IconButton>
          <IconButton
            onClick={toggleRecorder}
            disabled={isLoading}
            color={isRecording ? "error" : "primary"}
            sx={{
              ml: 1,
              animation: isRecording ? `${heartbeat} 0.8s infinite` : "none",
            }}
          >
            <MicIcon />
          </IconButton>
          <IconButton
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            color="primary"
            sx={{ ml: 1 }}
          >
            <UploadFileIcon />
          </IconButton>
          <Input
            type="file"
            inputRef={fileInputRef}
            sx={{ display: "none" }}
            onChange={handleFileUpload}
            inputProps={{ accept: "audio/*" }}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 2,
            mt: 2,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon sx={{ marginLeft: 2 }} />}
            onClick={handleNewChat}
            disabled={isLoading}
            sx={{ minWidth: "150px" }}
          >
            چت جدید
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon sx={{ marginLeft: 2 }} />}
            onClick={handleExportToWord}
            disabled={isLoading}
            sx={{ minWidth: "150px" }}
          >
            دانلود چت
          </Button>
          <FormControlLabel
            control={
              <Switch
                checked={isAIMode}
                onChange={() => setIsAIMode(!isAIMode)}
                disabled={isLoading}
              />
            }
            label="حالت هوش مصنوعی"
            sx={{ color: "text.primary" }}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
