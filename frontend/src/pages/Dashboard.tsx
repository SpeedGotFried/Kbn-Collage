import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import ContactSidebar from "@/components/chat/ContactSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { Contact, Message } from "@/types/chat";

// Mock data
const mockContacts: Contact[] = [
  {
    id: "1",
    name: "Alex Quantum",
    phone: "+1234567890",
    avatar: "🌟",
    status: "online",
    lastMessage: "Hey! How's the 3D messaging working?",
    lastMessageTime: "2 min ago",
    unreadCount: 2
  },
  {
    id: "2", 
    name: "Sarah Nebula",
    phone: "+1234567891",
    avatar: "🌙",
    status: "typing",
    lastMessage: "The file encryption is amazing!",
    lastMessageTime: "5 min ago",
    unreadCount: 0
  },
  {
    id: "3",
    name: "Mike Cosmos",
    phone: "+1234567892", 
    avatar: "🚀",
    status: "offline",
    lastMessage: "Can't wait to try the teleport messages",
    lastMessageTime: "1 hour ago",
    unreadCount: 1
  },
  {
    id: "4",
    name: "Luna Galaxy",
    phone: "+1234567893",
    avatar: "🌌",
    status: "dnd",
    lastMessage: "This quantum vault feature is incredible",
    lastMessageTime: "3 hours ago",
    unreadCount: 0
  }
];

const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "1",
      text: "Hey! How's the 3D messaging working?",
      sender: "1",
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      type: "text"
    },
    {
      id: "2", 
      text: "It's absolutely incredible! The quantum avatars are so cool 🌟",
      sender: "me",
      timestamp: new Date(Date.now() - 1 * 60 * 1000),
      type: "text"
    }
  ],
  "2": [
    {
      id: "3",
      text: "The file encryption is amazing!",
      sender: "2",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      type: "text"
    },
    {
      id: "4",
      text: "I love how the cubes unfold when you decrypt them",
      sender: "me", 
      timestamp: new Date(Date.now() - 4 * 60 * 1000),
      type: "text"
    },
    {
      id: "5",
      text: "document.pdf",
      sender: "2",
      timestamp: new Date(Date.now() - 3 * 60 * 1000),
      type: "file",
      fileName: "document.pdf",
      fileSize: "2.4 MB"
    }
  ]
};

const Dashboard = () => {
  const [selectedContact, setSelectedContact] = useState<string | null>("1");
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320); // Default width in pixels
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const newWidth = e.clientX;
    // Set minimum and maximum widths
    const minWidth = 250;
    const maxWidth = window.innerWidth * 0.6; // Max 60% of screen width
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setSidebarWidth(newWidth);
    }
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleSendMessage = (text: string) => {
    if (!selectedContact) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "me",
      timestamp: new Date(),
      type: "text"
    };

    setMessages(prev => ({
      ...prev,
      [selectedContact]: [...(prev[selectedContact] || []), newMessage]
    }));

    // Update contact's last message
    setContacts(prev => prev.map(contact => 
      contact.id === selectedContact 
        ? { ...contact, lastMessage: text, lastMessageTime: "now" }
        : contact
    ));
  };

  const handleSendFile = (file: File) => {
    if (!selectedContact) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: file.name,
      sender: "me",
      timestamp: new Date(),
      type: "file",
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`
    };

    setMessages(prev => ({
      ...prev,
      [selectedContact]: [...(prev[selectedContact] || []), newMessage]
    }));
  };

  const handleAddFriend = (contact: Contact) => {
    setContacts(prev => [...prev, contact]);
  };

  return (
    <div className="h-screen bg-background overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex h-full relative"
      >
        {/* Contact Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ 
            x: isFullscreen ? -sidebarWidth : 0,
            opacity: isFullscreen ? 0 : 1 
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="border-r border-border/20 glass-panel relative"
          style={{ width: `${sidebarWidth}px`, minWidth: `${sidebarWidth}px` }}
        >
          <ContactSidebar 
            contacts={contacts}
            selectedContact={selectedContact}
            onSelectContact={setSelectedContact}
            onAddFriend={handleAddFriend}
          />
        </motion.div>

        {/* Resize Handle */}
        {!isFullscreen && (
          <div
            className={`w-1 bg-border/20 hover:bg-primary/50 cursor-col-resize transition-colors duration-200 relative group ${
              isResizing ? 'bg-primary/70' : ''
            }`}
            onMouseDown={handleMouseDown}
          >
            <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-primary/20 transition-colors duration-200" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-border/40 rounded-full group-hover:bg-primary/60 transition-colors duration-200" />
          </div>
        )}

        {/* Chat Window */}
        <motion.div
          initial={{ x: 300 }}
          animate={{ 
            x: 0,
            marginLeft: isFullscreen ? -sidebarWidth : 0,
            width: isFullscreen ? "100vw" : "auto"
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="flex-1 flex flex-col"
          style={{ width: isFullscreen ? '100vw' : `calc(100vw - ${sidebarWidth}px - 4px)` }}
        >
          {selectedContact ? (
            <ChatWindow
              contact={contacts.find(c => c.id === selectedContact)!}
              messages={messages[selectedContact] || []}
              onSendMessage={handleSendMessage}
              onSendFile={handleSendFile}
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="glass-panel p-8 rounded-full w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-4xl">💬</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Select a chat</h3>
                <p>Choose a contact to start messaging</p>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;