import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Settings, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Contact } from "@/types/chat";
import QuantumAvatar from "./QuantumAvatar";
import FriendProfileModal from "./FriendProfileModal";
import { cn } from "@/lib/utils";

interface ContactSidebarProps {
  contacts: Contact[];
  selectedContact: string | null;
  onSelectContact: (contactId: string) => void;
  onAddFriend: (contact: Contact) => void;
}

const ContactSidebar = ({ contacts, selectedContact, onSelectContact, onAddFriend }: ContactSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const [showProfile, setShowProfile] = useState(false);
  const [selectedProfileContact, setSelectedProfileContact] = useState<Contact | null>(null);
  const navigate = useNavigate();

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phone.includes(searchQuery)
  );

  const formatTime = (timeStr: string) => {
    if (timeStr === "now") return "now";
    return timeStr;
  };

  const handleContactClick = (contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.detail === 2) { // Double click
      setSelectedProfileContact(contact);
      setShowProfile(true);
    } else {
      onSelectContact(contact.id);
    }
  };

  const handleAvatarClick = (contact: Contact, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProfileContact(contact);
    setShowProfile(true);
  };

  return (
    <div className="h-full flex flex-col bg-sidebar">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-sidebar-foreground">QuantumChat</h1>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/profile")}
              className="hover-glow"
            >
              <User className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/settings")}
              className="hover-glow"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass-panel"
          />
        </div>
      </div>

      {/* Add Contact Button */}
      <div className="p-4 border-b border-sidebar-border">
        <Button 
          onClick={() => navigate("/friends")}
          className="w-full glass-button hover-glow justify-start"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Friend
        </Button>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto">
        {filteredContacts.map((contact, index) => (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "p-4 border-b border-sidebar-border cursor-pointer transition-all duration-200 hover:bg-sidebar-accent",
              selectedContact === contact.id && "bg-sidebar-accent"
            )}
            onClick={(e) => handleContactClick(contact, e)}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div onClick={(e) => handleAvatarClick(contact, e)}>
                <QuantumAvatar status={contact.status} size="md">
                  <span className="text-lg">👤</span>
                </QuantumAvatar>
              </div>

              {/* Contact Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sidebar-foreground truncate">
                    {contact.name}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(contact.lastMessageTime)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground truncate">
                    {contact.lastMessage}
                  </p>
                  
                  {contact.unreadCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold"
                    >
                      {contact.unreadCount}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredContacts.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <div className="glass-panel p-6 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Search className="w-8 h-8" />
            </div>
            <p>No contacts found</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <FriendProfileModal
        contact={selectedProfileContact}
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        onStartChat={(contactId) => {
          onSelectContact(contactId);
          setShowProfile(false);
        }}
      />
    </div>
  );
};

export default ContactSidebar;