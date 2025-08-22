import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import ContactSidebar from "@/components/chat/ContactSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { Contact, Message } from "@/types/chat";

const Dashboard = () => {
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320); // Default width in pixels
  const [isResizing, setIsResizing] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const mapFriendToContact = (friend: any): Contact => {
    // Backend returns friend_id (the other user's 16-digit user_id) and created_at
    return {
      id: friend.friend_id,
      name: friend.friend_id,
      phone: "",
      avatar: "👤",
      status: "offline",
      lastMessage: "",
      lastMessageTime: "",
      unreadCount: 0
    };
  };

  const fetchContacts = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8000/v1/friends/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const mapped: Contact[] = (data || []).map(mapFriendToContact);
      setContacts(mapped);
      if (!selectedContact && mapped.length > 0) {
        setSelectedContact(mapped[0].id);
      }
    } catch (e) {
      console.error("Failed to load contacts", e);
    }
  };

  const mapBackendMessage = (msg: any, currentUserId: string, friendId: string): Message => {
    const sender = msg.sender?.user_id === currentUserId ? "me" : friendId;
    let text = "Encrypted message";
    const payload = msg.encrypted_content;
    if (payload && typeof payload === "object") {
      if (payload.scheme === "PLAINTEXT_DEV" && payload.content_b64) {
        try {
          text = atob(payload.content_b64);
        } catch (e) {
          console.warn("Failed to decode plaintext envelope", e);
        }
      }
    }
    return {
      id: String(msg.id),
      text,
      sender,
      timestamp: new Date(msg.created_at),
      type: "text"
    };
  };

  const fetchMessagesFor = async (friendId: string) => {
    if (!token) return;
    try {
      const resProfile = await fetch("http://localhost:8000/v1/profile/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resProfile.ok) return;
      const me = await resProfile.json();
      const myUserId: string = me.user_id;

      const res = await fetch(`http://localhost:8000/v1/chat/messages/${friendId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const mapped: Message[] = (data || []).map((m: any) => mapBackendMessage(m, myUserId, friendId));
      setMessages(prev => ({ ...prev, [friendId]: mapped }));
    } catch (e) {
      console.error("Failed to load messages", e);
    }
  };

  const sendMessageToBackend = async (friendId: string, text: string) => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:8000/v1/chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiver_id: friendId, content: text }),
      });
      if (!res.ok) {
        console.error("Failed to send message");
        return null;
      }
      const data = await res.json();
      return data;
    } catch (e) {
      console.error("Failed to send message", e);
      return null;
    }
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    const newWidth = e.clientX;
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

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (selectedContact) {
      fetchMessagesFor(selectedContact);
    }
  }, [selectedContact]);

  const handleSendMessage = async (text: string) => {
    if (!selectedContact) return;
    const backendMsg = await sendMessageToBackend(selectedContact, text);
    if (!backendMsg) return;

    const newMessage: Message = {
      id: String(backendMsg.id || Date.now()),
      text,
      sender: "me",
      timestamp: new Date(),
      type: "text"
    };

    setMessages(prev => ({
      ...prev,
      [selectedContact]: [...(prev[selectedContact] || []), newMessage]
    }));

    setContacts(prev => prev.map(contact => 
      contact.id === selectedContact 
        ? { ...contact, lastMessage: text, lastMessageTime: "now" }
        : contact
    ));
  };

  const handleSendFile = (_file: File) => {
    // File sending pipeline not implemented to backend yet.
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