export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  status: "online" | "offline" | "typing" | "dnd";
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  text: string;
  sender: string; // "me" or contact id
  timestamp: Date;
  type: "text";
  mood?: "happy" | "sad" | "angry" | "excited" | "neutral";
}

export type MoodType = "happy" | "sad" | "angry" | "excited" | "neutral";
export type StatusType = "online" | "offline" | "typing" | "dnd";