import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
}

const EmojiPicker = ({ isOpen, onClose, onEmojiSelect }: EmojiPickerProps) => {
  const emojiCategories = {
    "Smileys": ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳"],
    "Gestures": ["👍", "👎", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👋", "🤚", "🖐️", "✋", "🖖", "👏", "🙌", "🤝", "🙏"],
    "Hearts": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"],
    "Objects": ["🎉", "🎊", "🎈", "🎁", "🏆", "🥇", "🥈", "🥉", "⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅"],
    "Nature": ["🌟", "⭐", "🌙", "☀️", "⛅", "🌈", "🔥", "💧", "🌊", "🌍", "🌎", "🌏", "🌕", "🌖", "🌗", "🌘", "🌑", "🌒", "🌓", "🌔", "🌚", "🌝", "🌛", "🌜", "☄️", "💫", "⚡", "❄️", "🌀", "🌪️"]
  };

  const [activeCategory, setActiveCategory] = useState("Smileys");

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={onClose}
          />
          
          {/* Emoji Picker */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute bottom-16 left-12 z-50 glass-panel rounded-2xl p-4 w-80 max-h-96 overflow-hidden shadow-2xl"
          >
            {/* Category Tabs */}
            <div className="flex gap-1 mb-3 overflow-x-auto">
              {Object.keys(emojiCategories).map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                  className={`text-xs whitespace-nowrap ${
                    activeCategory === category 
                      ? "bg-primary text-primary-foreground" 
                      : "hover-glow"
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Emoji Grid */}
            <div className="grid grid-cols-8 gap-1 max-h-64 overflow-y-auto">
              {emojiCategories[activeCategory as keyof typeof emojiCategories].map((emoji, index) => (
                <Button
                  key={`${emoji}-${index}`}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEmojiClick(emoji)}
                  className="aspect-square text-lg hover-glow p-1 h-8 w-8"
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EmojiPicker;