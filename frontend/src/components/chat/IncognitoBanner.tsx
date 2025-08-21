import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Clock } from "lucide-react";

interface IncognitoBannerProps {
  autoDeleteMinutes?: number;
}

const IncognitoBanner = ({ autoDeleteMinutes = 10 }: IncognitoBannerProps) => {
  const [timeLeft, setTimeLeft] = useState(autoDeleteMinutes * 60); // Convert to seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-r from-red-500/20 to-orange-500/20 border-b border-red-500/30 backdrop-blur-sm"
    >
      <div className="px-4 py-2 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-red-200">
          <Shield className="w-4 h-4" />
          <span className="font-medium">Incognito Active</span>
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 bg-red-400 rounded-full"
          />
        </div>
        
        <div className="flex items-center gap-1 text-red-200">
          <Clock className="w-3 h-3" />
          <span>Auto-delete in {formatTime(timeLeft)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default IncognitoBanner;