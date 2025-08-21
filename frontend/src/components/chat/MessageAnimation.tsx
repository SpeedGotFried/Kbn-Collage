import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface MessageAnimationProps {
  message: string;
  sender: string;
  onAnimationComplete?: () => void;
}

const MessageAnimation = ({ message, sender, onAnimationComplete }: MessageAnimationProps) => {
  const [showOrb, setShowOrb] = useState(true);
  const [showTrail, setShowTrail] = useState(false);
  
  const isSent = sender === "me";

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setShowTrail(true);
    }, 200);

    const timer2 = setTimeout(() => {
      setShowOrb(false);
      onAnimationComplete?.();
    }, 800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onAnimationComplete]);

  if (!showOrb) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Teleport Orb */}
      <motion.div
        initial={{
          x: isSent ? "20%" : "80%",
          y: "50%",
          scale: 0.1,
          opacity: 0
        }}
        animate={{
          x: isSent ? "80%" : "20%",
          y: "20%",
          scale: [0.1, 1, 0.8, 0.1],
          opacity: [0, 1, 1, 0]
        }}
        transition={{
          duration: 0.8,
          ease: "easeInOut",
          times: [0, 0.2, 0.8, 1]
        }}
        className="absolute"
      >
        <div className="w-8 h-8 relative">
          {/* Core Orb */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full animate-pulse" />
          
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/60 to-primary rounded-full blur-sm animate-pulse" />
          
          {/* Particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: Math.cos(i * Math.PI / 3) * 20,
                y: Math.sin(i * Math.PI / 3) * 20
              }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                repeat: 1
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Comet Trail */}
      {showTrail && (
        <motion.div
          initial={{
            x: isSent ? "20%" : "80%",
            y: "50%",
            width: 0,
            opacity: 0
          }}
          animate={{
            x: isSent ? "80%" : "20%",
            y: "20%",
            width: 100,
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 0.6,
            ease: "easeOut"
          }}
          className="absolute h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
        />
      )}
    </div>
  );
};

export default MessageAnimation;