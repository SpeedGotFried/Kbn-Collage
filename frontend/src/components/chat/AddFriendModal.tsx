import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, QrCode, Phone, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Contact } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFriend: (contact: Contact) => void;
}

const AddFriendModal = ({ isOpen, onClose, onAddFriend }: AddFriendModalProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddByPhone = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newContact: Contact = {
        id: Date.now().toString(),
        name: `Contact ${phoneNumber.slice(-4)}`,
        phone: phoneNumber,
        avatar: "👤",
        status: "offline",
        lastMessage: "",
        lastMessageTime: "never",
        unreadCount: 0
      };
      
      onAddFriend(newContact);
      setIsLoading(false);
      setPhoneNumber("");
      onClose();
      
      toast({
        title: "Friend Added!",
        description: `${newContact.name} has been added to your contacts`
      });
    }, 1000);
  };

  const handleAddById = async () => {
    if (!userId.trim() || userId.length !== 16) {
      toast({
        title: "Invalid User ID",
        description: "Please enter a valid 16-digit user ID",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const avatars = ["🌟", "🌙", "🚀", "🌌", "💫", "⭐", "🔥", "💎"];
      const names = ["Alex Quantum", "Sarah Nebula", "Mike Cosmos", "Luna Galaxy", "Nova Star", "Zen Aurora"];
      
      const newContact: Contact = {
        id: Date.now().toString(),
        name: names[Math.floor(Math.random() * names.length)],
        phone: userId,
        avatar: avatars[Math.floor(Math.random() * avatars.length)],
        status: Math.random() > 0.5 ? "online" : "offline",
        lastMessage: "",
        lastMessageTime: "never",
        unreadCount: 0
      };
      
      onAddFriend(newContact);
      setIsLoading(false);
      setUserId("");
      onClose();
      
      toast({
        title: "Friend Added!",
        description: `${newContact.name} has been added to your contacts`
      });
    }, 1000);
  };

  const handleQRScan = () => {
    toast({
      title: "QR Scanner",
      description: "QR scanning feature coming soon!"
    });
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
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.5, y: 50, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="glass-panel p-6 rounded-3xl max-w-md w-full mx-auto relative"
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

            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-block glass-panel p-4 rounded-full mb-4"
              >
                <Plus className="w-8 h-8 text-primary" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-foreground">Add Friend</h2>
              <p className="text-muted-foreground text-sm mt-2">
                Connect with friends using their phone number or user ID
              </p>
            </div>

            {/* Add Friend Tabs */}
            <Tabs defaultValue="phone" className="w-full">
              <TabsList className="grid w-full grid-cols-3 glass-panel">
                <TabsTrigger value="phone" className="data-[state=active]:bg-primary/20">
                  <Phone className="w-4 h-4 mr-2" />
                  Phone
                </TabsTrigger>
                <TabsTrigger value="id" className="data-[state=active]:bg-primary/20">
                  <Hash className="w-4 h-4 mr-2" />
                  User ID
                </TabsTrigger>
                <TabsTrigger value="qr" className="data-[state=active]:bg-primary/20">
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Code
                </TabsTrigger>
              </TabsList>

              <TabsContent value="phone" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="glass-panel"
                  />
                </div>
                <Button
                  onClick={handleAddByPhone}
                  disabled={isLoading}
                  className="w-full glass-button hover-glow"
                >
                  {isLoading ? "Adding..." : "Add Friend"}
                </Button>
              </TabsContent>

              <TabsContent value="id" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="userid">16-Digit User ID</Label>
                  <Input
                    id="userid"
                    type="text"
                    placeholder="1234567890123456"
                    maxLength={16}
                    value={userId}
                    onChange={(e) => setUserId(e.target.value.replace(/\D/g, ''))}
                    className="glass-panel font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    {userId.length}/16 digits
                  </p>
                </div>
                <Button
                  onClick={handleAddById}
                  disabled={isLoading}
                  className="w-full glass-button hover-glow"
                >
                  {isLoading ? "Adding..." : "Add Friend"}
                </Button>
              </TabsContent>

              <TabsContent value="qr" className="space-y-4 mt-4">
                <div className="text-center py-8">
                  <div className="glass-panel p-8 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-primary" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Scan your friend's QR code to add them instantly
                  </p>
                  <Button
                    onClick={handleQRScan}
                    className="glass-button hover-glow"
                  >
                    Open QR Scanner
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddFriendModal;