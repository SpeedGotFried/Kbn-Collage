import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MoreVertical, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Contact, Message } from "@/types/chat";
import QuantumAvatar from "./QuantumAvatar";
import ChatBubble from "./ChatBubble";
import TeleportOrb from "./TeleportOrb";
import IncognitoToggle from "./IncognitoToggle";
import MessageAnimation from "./MessageAnimation";
import IncognitoBanner from "./IncognitoBanner";
// Emoji picker removed

interface ChatWindowProps {
  contact: Contact;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onSendFile?: (file: File) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const ChatWindow = ({ contact, messages, onSendMessage, onSendFile, isFullscreen = false, onToggleFullscreen }: ChatWindowProps) => {
  const [inputValue, setInputValue] = useState("");
  const [showTeleport, setShowTeleport] = useState(false);
  const [isIncognito, setIsIncognito] = useState(false);
  const [animatingMessage, setAnimatingMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
              <span className="text-lg">��</span>
            </QuantumAvatar>
            <div>
              <h2 className="font-semibold flex items-center gap-2">
                {contact.name}
                {isIncognito && <span className="text-xs">🔒</span>}
              </h2>
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
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"} mb-4`}
            >
<<<<<<< Updated upstream
              <div
                className={`chat-bubble ${
                  message.sender === "me" ? "sent" : "received"
                } max-w-xs lg:max-w-md`}
              >
                {message.type === "file" ? (
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <Paperclip className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">{message.fileName}</span>
                    </div>
                    {message.fileSize && (
                      <span className="text-xs text-muted-foreground">{message.fileSize}</span>
                    )}
                    <button
                      onClick={() => {
                        if (message.fileContent && message.fileName) {
                          try {
                            // Decode base64 content
                            const binaryString = atob(message.fileContent);
                            const bytes = new Uint8Array(binaryString.length);
                            for (let i = 0; i < binaryString.length; i++) {
                              bytes[i] = binaryString.charCodeAt(i);
                            }
                            
                            // Create blob and download
                            const blob = new Blob([bytes], { 
                              type: message.fileName.endsWith('.pdf') ? 'application/pdf' : 
                                    message.fileName.endsWith('.jpg') || message.fileName.endsWith('.jpeg') ? 'image/jpeg' :
                                    message.fileName.endsWith('.png') ? 'image/png' : 'application/octet-stream'
                            });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = message.fileName;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          } catch (e) {
                            console.error('Failed to download file:', e);
                            alert('Failed to download file');
                          }
                        }
                      }}
                      className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm hover:bg-primary/90 transition-colors"
                    >
                      Download File
                    </button>
                  </div>
                ) : (
                  <p className="text-sm">{message.text}</p>
                )}
                <span className="text-xs text-muted-foreground mt-1 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
=======
              <ChatBubble
                message={message.text}
                sender={message.sender}
                timestamp={message.timestamp}
                mood={detectMood(message.text)}
              />
>>>>>>> Stashed changes
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
              <div className="text-sm text-muted-foreground">typing...</div>
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