import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileCubeProps {
  fileName: string;
  fileSize: string;
  sender: string;
}

const FileCube = ({ fileName, fileSize, sender }: FileCubeProps) => {
  const [isUnfolded, setIsUnfolded] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const isSent = sender === "me";

  const handleUnfold = () => {
    if (isUnfolded) return;
    
    setIsDecrypting(true);
    setTimeout(() => {
      setIsDecrypting(false);
      setIsUnfolded(true);
    }, 1500);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const iconMap: Record<string, string> = {
      pdf: "📄",
      doc: "📝", 
      docx: "📝",
      txt: "📄",
      jpg: "🖼️",
      jpeg: "🖼️", 
      png: "🖼️",
      gif: "🖼️",
      mp4: "🎥",
      mp3: "🎵",
      zip: "📦",
      rar: "📦"
    };
    return iconMap[ext || ""] || "📁";
  };

  if (isUnfolded) {
    return (
      <motion.div
        initial={{ scale: 1.2, rotateY: 180 }}
        animate={{ scale: 1, rotateY: 0 }}
        className={cn(
          "file-cube p-4 max-w-xs",
          isSent ? "ml-auto" : ""
        )}
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">{getFileIcon(fileName)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{fileName}</p>
            <p className="text-xs text-muted-foreground">{fileSize}</p>
          </div>
          <Button size="sm" variant="ghost" className="hover-glow">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(
        "file-cube p-6 cursor-pointer relative",
        isSent ? "ml-auto" : "",
        isDecrypting && "animate-cube-unfold"
      )}
      onClick={handleUnfold}
      whileHover={{ 
        rotateX: 15, 
        rotateY: 15, 
        scale: 1.05 
      }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Encrypted Cube Visualization */}
      <div className="relative">
        {/* Cube faces */}
        <div className="w-16 h-16 mx-auto mb-3 relative transform-gpu perspective-1000">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg border border-primary/30"
            animate={isDecrypting ? { rotateY: [0, 90, 180, 270, 360] } : {}}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {isDecrypting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Lock className="w-6 h-6 text-primary" />
                </motion.div>
              ) : (
                <div className="text-xl">{getFileIcon(fileName)}</div>
              )}
            </div>
          </motion.div>
        </div>

        {/* File Info */}
        <div className="text-center">
          <p className="text-sm font-medium truncate mb-1">{fileName}</p>
          <p className="text-xs text-muted-foreground">{fileSize}</p>
        </div>

        {/* Encryption Status */}
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
          {isDecrypting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Unlock className="w-3 h-3" />
              </motion.div>
              <span>Decrypting...</span>
            </>
          ) : (
            <>
              <Lock className="w-3 h-3" />
              <span>Encrypted</span>
            </>
          )}
        </div>

        {/* Particle Effects */}
        {isDecrypting && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary rounded-full"
                initial={{ 
                  x: 32, 
                  y: 32, 
                  opacity: 1 
                }}
                animate={{
                  x: Math.cos(i * 45 * Math.PI / 180) * 40 + 32,
                  y: Math.sin(i * 45 * Math.PI / 180) * 40 + 32,
                  opacity: 0
                }}
                transition={{ 
                  duration: 1.5, 
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Glow Effect */}
      <div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};

export default FileCube;