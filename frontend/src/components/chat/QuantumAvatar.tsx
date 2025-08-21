import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { StatusType } from "@/types/chat";

interface QuantumAvatarProps {
  status: StatusType;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  children: React.ReactNode;
}

const QuantumAvatar = ({ status, size = "md", className, children }: QuantumAvatarProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  const statusClasses = {
    online: "quantum-avatar online",
    typing: "quantum-avatar typing", 
    offline: "quantum-avatar offline",
    dnd: "quantum-avatar dnd"
  };

  return (
    <motion.div
      className={cn(
        "quantum-avatar relative rounded-full flex items-center justify-center",
        sizeClasses[size],
        statusClasses[status],
        className
      )}
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {children}
      
      {/* Status indicator */}
      <div
        className={cn(
          "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
          {
            "bg-quantum-online": status === "online",
            "bg-quantum-typing animate-typing-pulse": status === "typing", 
            "bg-quantum-offline": status === "offline",
            "bg-quantum-dnd animate-dnd-pulse": status === "dnd"
          }
        )}
      />
    </motion.div>
  );
};

export default QuantumAvatar;