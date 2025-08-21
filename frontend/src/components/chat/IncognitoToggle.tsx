import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import IncognitoPasswordModal from "./IncognitoPasswordModal";

interface IncognitoToggleProps {
  isIncognito: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}

const IncognitoToggle = ({ isIncognito, onToggle, className }: IncognitoToggleProps) => {
  const { toast } = useToast();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleToggle = () => {
    if (!isIncognito) {
      // Trying to enable incognito - show password modal
      setShowPasswordModal(true);
    } else {
      // Disabling incognito
      onToggle(false);
      toast({
        title: "Incognito Mode Deactivated",
        description: "Normal chat mode restored."
      });
    }
  };

  const handlePasswordSuccess = () => {
    setShowPasswordModal(false);
    onToggle(true);
    toast({
      title: "Incognito Mode Activated",
      description: "Messages will auto-delete. Enhanced privacy enabled."
    });
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn("relative", className)}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className={cn(
            "hover-glow transition-all duration-300",
            isIncognito 
              ? "bg-red-500/20 text-red-400 border border-red-500/30" 
              : "text-muted-foreground"
          )}
        >
          {isIncognito ? (
            <>
              <EyeOff className="w-4 h-4 mr-1" />
              <Shield className="w-3 h-3" />
            </>
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </Button>
        
        {isIncognito && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
          />
        )}
      </motion.div>

      <IncognitoPasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={handlePasswordSuccess}
      />
    </>
  );
};

export default IncognitoToggle;