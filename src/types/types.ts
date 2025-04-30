export interface UserDoc {
  $id: string;
  clerkId: string;
  month: string;
  usageCount: number;
  mode?: string;
  activeNoteId?: string;
}

export interface SessionDoc {
  $id: string;
  $createdAt: Date;
  clerkId: string;
  active: boolean;
  context?: string;
}

export interface ChatDoc {
  $id: string;
  $createdAt: Date;
  sessionId: string;
  clerkId: string;
  role: string;
  content: string;
}

export interface NoteDoc {
  $id: string;
  clerkId: string;
  createdAt: string;
  active: boolean;
}

export interface NoteChunkDoc {
  $id: string;
  noteId: string;
  content: string;
  createdAt: string;
}

// Type for buttons used in chat responses
export interface Button {
  text: string;
  callback_data: string;
}

// Type for API response structure expected by the Chat component
export interface ChatResponse {
  message: string;
  buttons?: Button[][];
}
