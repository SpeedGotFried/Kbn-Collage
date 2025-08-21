import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Share, MessageCircle, Shield, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Contact } from "@/types/chat";
import QuantumAvatar from "./QuantumAvatar";
import QRCodeGenerator from "../profile/QRCodeGenerator";
import { useToast } from "@/hooks/use-toast";

interface FriendProfileModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (contactId: string) => void;
}

const FriendProfileModal = ({ contact, isOpen, onClose, onStartChat }: FriendProfileModalProps) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const { toast } = useToast();

  if (!contact) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(contact.phone);
    toast({
      title: "ID Copied!",
      description: "Contact ID copied to clipboard"
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Contact: ${contact.name}`,
        text: `Add ${contact.name} on QuantumChat`,
        url: `https://quantumchat.app/add/${contact.phone}`
      });
    } else {
      navigator.clipboard.writeText(`Add ${contact.name} on QuantumChat: ${contact.phone}`);
      toast({
        title: "Share link copied!",
        description: "Share link copied to clipboard"
      });
    }
  };

  const handleBlock = () => {
    setIsBlocked(!isBlocked);
    toast({
      title: isBlocked ? "Contact Unblocked" : "Contact Blocked",
      description: isBlocked ? `${contact.name} has been unblocked` : `${contact.name} has been blocked`
    });
  };

  const handleStartChat = () => {
    onStartChat(contact.id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, rotateY: -90, opacity: 0 }}
            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
            exit={{ scale: 0.5, rotateY: 90, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="glass-panel p-8 rounded-3xl max-w-md w-full mx-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 hover-glow"
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Profile Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mb-4"
              >
                <QuantumAvatar status={contact.status} size="xl">
                  <span className="text-4xl">{contact.avatar}</span>
                </QuantumAvatar>
              </motion.div>
              
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-foreground mb-2"
              >
                {contact.name}
              </motion.h2>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground text-sm"
              >
                {contact.phone}
              </motion.p>
            </div>

            {/* Status Message */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="glass-panel p-4 mb-6 rounded-xl"
            >
              <p className="text-sm text-center text-muted-foreground italic">
                "Living in the quantum realm of digital communication ✨"
              </p>
            </motion.div>

            {/* User ID Section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mb-6"
            >
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">CONTACT ID</h3>
              <div className="flex items-center gap-2 glass-panel p-3 rounded-lg">
                <code className="flex-1 text-sm font-mono">{contact.phone}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyId}
                  className="hover-glow"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>

            {/* QR Code */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mb-6 text-center"
            >
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">QR CODE</h3>
              <div className="inline-block glass-panel p-4 rounded-xl">
                <QRCodeGenerator value={contact.phone} size={120} />
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <Button
                onClick={handleStartChat}
                className="w-full glass-button hover-glow"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Chat
              </Button>
              
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={handleShare}
                  className="flex-1 glass-button hover-glow"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={handleBlock}
                  className={`flex-1 glass-button hover-glow ${isBlocked ? 'text-green-400' : 'text-red-400'}`}
                >
                  {isBlocked ? (
                    <>
                      <ShieldOff className="w-4 h-4 mr-2" />
                      Unblock
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Block
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FriendProfileModal;