import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Smile, MoreVertical, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Contact, Message } from "@/types/chat";
import QuantumAvatar from "./QuantumAvatar";
import ChatBubble from "./ChatBubble";
import FileCube from "./FileCube";
import TeleportOrb from "./TeleportOrb";
import IncognitoToggle from "./IncognitoToggle";
import MessageAnimation from "./MessageAnimation";
import IncognitoBanner from "./IncognitoBanner";
import EmojiPicker from "./EmojiPicker";

interface ChatWindowProps {
  contact: Contact;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onSendFile: (file: File) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const ChatWindow = ({ contact, messages, onSendMessage, onSendFile, isFullscreen = false, onToggleFullscreen }: ChatWindowProps) => {
  const [inputValue, setInputValue] = useState("");
  const [showTeleport, setShowTeleport] = useState(false);
  const [isIncognito, setIsIncognito] = useState(false);
  const [animatingMessage, setAnimatingMessage] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const messageText = inputValue.trim();
      
      // Show message animation
      setAnimatingMessage(messageText);
      setTimeout(() => setAnimatingMessage(null), 1000);
      
      // Send message after animation starts
      setTimeout(() => {
        onSendMessage(messageText);
      }, 200);
      
      setInputValue("");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendFile(file);
    }
  };

  const detectMood = (text: string): "happy" | "sad" | "angry" | "excited" | "neutral" => {
    const happyWords = ["happy", "joy", "great", "awesome", "love", "😊", "😄", "🎉"];
    const sadWords = ["sad", "sorry", "disappointed", "😢", "😞"];
    const angryWords = ["angry", "mad", "frustrated", "😠", "😡"];
    const excitedWords = ["excited", "amazing", "incredible", "wow", "🔥", "✨"];
    
    const lowerText = text.toLowerCase();
    
    if (happyWords.some(word => lowerText.includes(word))) return "happy";
    if (sadWords.some(word => lowerText.includes(word))) return "sad";
    if (angryWords.some(word => lowerText.includes(word))) return "angry";
    if (excitedWords.some(word => lowerText.includes(word))) return "excited";
    
    return "neutral";
  };

  return (
    <motion.div 
      className={`h-full flex flex-col bg-background relative overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}
      animate={isFullscreen ? { scale: 1, x: 0 } : { scale: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {/* Incognito Banner */}
      {isIncognito && <IncognitoBanner autoDeleteMinutes={10} />}
      
      {/* Mood Background */}
      {messages.length > 0 && (
        <div 
          className={`absolute inset-0 pointer-events-none z-0 opacity-20 mood-${detectMood(messages[messages.length - 1]?.text || "")}`}
        />
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 border-b border-border/20 glass-panel z-10 relative ${isIncognito ? 'pt-16' : ''}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <QuantumAvatar status={contact.status} size="md">
              <span className="text-lg">{contact.avatar}</span>
            </QuantumAvatar>
            <div>
              <h2 className="font-semibold flex items-center gap-2">
                {contact.name}
                {isIncognito && <span className="text-xs">🔒</span>}
              </h2>
              <p className="text-sm text-muted-foreground capitalize">
                {contact.status === "typing" && !isIncognito ? "typing..." : contact.status}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <IncognitoToggle
              isIncognito={isIncognito}
              onToggle={setIsIncognito}
            />
            {onToggleFullscreen && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onToggleFullscreen}
                className="hover-glow"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </Button>
            )}
            <Button variant="ghost" size="sm" className="hover-glow">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10 relative">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              {message.type === "file" ? (
                <FileCube
                  fileName={message.fileName!}
                  fileSize={message.fileSize!}
                  sender={message.sender}
                />
              ) : (
                <ChatBubble
                  message={message.text}
                  sender={message.sender}
                  timestamp={message.timestamp}
                  mood={detectMood(message.text)}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Typing Indicator */}
        {contact.status === "typing" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="chat-bubble received p-4">
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    className="w-2 h-2 bg-primary rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Animation */}
      <AnimatePresence>
        {animatingMessage && (
          <MessageAnimation 
            message={animatingMessage}
            sender="me"
            onAnimationComplete={() => setAnimatingMessage(null)}
          />
        )}
      </AnimatePresence>
      

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-t border-border/20 glass-panel z-10 relative"
      >
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="hover-glow"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="hover-glow"
            >
              <Smile className="w-4 h-4" />
            </Button>
            
            <EmojiPicker
              isOpen={showEmojiPicker}
              onClose={() => setShowEmojiPicker(false)}
              onEmojiSelect={(emoji) => {
                setInputValue(prev => prev + emoji);
              }}
            />
          </div>
          
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 glass-panel"
          />
          
          <Button
            type="submit"
            disabled={!inputValue.trim()}
            className="glass-button hover-glow"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ChatWindow;