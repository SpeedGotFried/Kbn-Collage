import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MoodType } from "@/types/chat";

interface ChatBubbleProps {
  message: string;
  sender: string;
  timestamp: Date;
  mood?: MoodType;
}

const ChatBubble = ({ message, sender, timestamp, mood = "neutral" }: ChatBubbleProps) => {
  const isSent = sender === "me";
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const moodEffects = {
    happy: "shadow-[0_0_20px_hsl(var(--mood-happy))]",
    sad: "shadow-[0_0_20px_hsl(var(--mood-sad))]", 
    angry: "shadow-[0_0_20px_hsl(var(--mood-angry))] animate-angry-pulse",
    excited: "shadow-[0_0_20px_hsl(var(--mood-excited))] animate-excited-wave",
    neutral: ""
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "chat-bubble max-w-xs lg:max-w-md p-4 relative group",
        isSent ? "sent ml-auto" : "received",
        mood !== "neutral" && moodEffects[mood]
      )}
    >
      {/* Message Content */}
      <p className="text-sm leading-relaxed break-words">{message}</p>
      
      {/* Timestamp */}
      <div className={cn(
        "flex items-center gap-2 mt-2 text-xs opacity-70",
        isSent ? "justify-end" : "justify-start"
      )}>
        <span>{formatTime(timestamp)}</span>
        {isSent && (
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-current rounded-full" />
            <div className="w-1 h-1 bg-current rounded-full" />
          </div>
        )}
      </div>

      {/* 3D Hover Effect */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl pointer-events-none",
        isSent ? "from-primary/50 to-primary-foreground/50" : "from-card/50 to-card-foreground/50"
      )} />
    </motion.div>
  );
};

export default ChatBubble;