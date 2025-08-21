import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Users, UserPlus, UserCheck, UserX, Phone, Hash, QrCode, Camera, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import QuantumAvatar from "@/components/chat/QuantumAvatar";
import QRScannerComponent from "@/components/qr/QRScanner";

interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  responded_at?: string;
  user_name?: string;
  user_avatar?: string;
}

interface Friend {
  user_id: string;
  friend_id: string;
  status: string;
  created_at: string;
  friend_name?: string;
  friend_avatar?: string;
}

const Friends = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("add");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [userId, setUserId] = useState("");
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showMyQRCode, setShowMyQRCode] = useState(false);
  const [userQRCode, setUserQRCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [friendRequests, setFriendRequests] = useState<{ received: FriendRequest[], sent: FriendRequest[] }>({ received: [], sent: [] });
  const [friends, setFriends] = useState<Friend[]>([]);

  // Fetch friend requests from backend
  const fetchFriendRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/v1/friends/requests', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Transform received requests
        const receivedRequests = data.received.map((req: any) => ({
          id: req.id.toString(),
          sender_id: req.sender.user_id,
          receiver_id: "current_user",
          status: req.status,
          created_at: req.created_at,
          user_name: req.sender.full_name,
          user_avatar: "👤" // Default avatar
        }));

        // Transform sent requests
        const sentRequests = data.sent.map((req: any) => ({
          id: req.id.toString(),
          sender_id: "current_user",
          receiver_id: req.receiver.user_id,
          status: req.status,
          created_at: req.created_at,
          user_name: req.receiver.full_name,
          user_avatar: "👤" // Default avatar
        }));

        setFriendRequests({
          received: receivedRequests,
          sent: sentRequests
        });
      } else {
        console.error('Failed to fetch friend requests');
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  // Fetch friends list from backend
  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/v1/friends/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Transform friends data
        const friendsList = data.map((friend: any) => ({
          user_id: friend.user_id,
          friend_id: friend.friend_id,
          status: friend.status,
          created_at: friend.created_at,
          friend_name: `Friend ${friend.friend_id}`, // Will be updated when we have user info
          friend_avatar: "👤" // Default avatar
        }));

        setFriends(friendsList);
      } else {
        console.error('Failed to fetch friends list');
      }
    } catch (error) {
      console.error('Error fetching friends list:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchFriendRequests();
    fetchFriends();
  }, []);

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
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/v1/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ receiver_id: phoneNumber })
      });

      if (response.ok) {
        toast({
          title: "Friend Request Sent!",
          description: `Friend request sent to ${phoneNumber}`
        });
        setPhoneNumber("");
        await fetchFriendRequests(); // Refresh friend requests
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to send friend request",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/v1/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ receiver_id: userId })
      });

      if (response.ok) {
        toast({
          title: "Friend Request Sent!",
          description: `Friend request sent to user ${userId}`
        });
        setUserId("");
        await fetchFriendRequests(); // Refresh friend requests
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to send friend request",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRScan = async (scannedUserId: string) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:8000/v1/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ receiver_id: scannedUserId })
      });

      if (response.ok) {
        toast({
          title: "Friend Request Sent!",
          description: `Friend request sent to user ${scannedUserId}`,
        });
        fetchFriendRequests(); // Refresh the friend requests
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to send friend request",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openQRScanner = () => {
    setShowQRScanner(true);
  };

  const fetchUserQRCode = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/v1/profile/qr', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserQRCode(data.qr_code);
        setShowMyQRCode(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to generate QR code",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      });
    }
  };

  const copyUserIdToClipboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/v1/profile/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        await navigator.clipboard.writeText(data.user_id);
        toast({
          title: "Copied!",
          description: "Your User ID has been copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error copying user ID:', error);
      toast({
        title: "Error",
        description: "Failed to copy User ID",
        variant: "destructive"
      });
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/v1/friends/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          request_id: parseInt(requestId),
          accept: true
        })
      });

      if (response.ok) {
        toast({
          title: "Friend Request Accepted!",
          description: "You are now friends"
        });
        // Refresh both friend requests and friends list
        await fetchFriendRequests();
        await fetchFriends();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to accept friend request",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast({
        title: "Error",
        description: "Failed to accept friend request",
        variant: "destructive"
      });
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/v1/friends/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          request_id: parseInt(requestId),
          accept: false
        })
      });

      if (response.ok) {
        toast({
          title: "Friend Request Declined",
          description: "Request has been declined"
        });
        // Refresh friend requests
        await fetchFriendRequests();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.detail || "Failed to decline friend request",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error declining friend request:', error);
      toast({
        title: "Error",
        description: "Failed to decline friend request",
        variant: "destructive"
      });
    }
  };

  const handleCancelRequest = (requestId: string) => {
    setFriendRequests(prev => ({
      ...prev,
      sent: prev.sent.filter(req => req.id !== requestId)
    }));
    toast({
      title: "Friend Request Cancelled",
      description: "Request has been cancelled"
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="glass-button hover-glow"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Chat
        </Button>
        
        <h1 className="text-2xl font-bold">Friends</h1>
        
        <div className="w-[120px]"></div> {/* Spacer for centering */}
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass-panel">
            <TabsTrigger value="add" className="data-[state=active]:bg-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Add Friends
            </TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-primary/20">
              <UserPlus className="w-4 h-4 mr-2" />
              Requests
              {(friendRequests.received.length + friendRequests.sent.length) > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {friendRequests.received.length + friendRequests.sent.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="friends" className="data-[state=active]:bg-primary/20">
              <Users className="w-4 h-4 mr-2" />
              My Friends
              <Badge variant="secondary" className="ml-2">
                {friends.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Add Friends Tab */}
          <TabsContent value="add" className="space-y-6 mt-6">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Friend
                </CardTitle>
                <CardDescription>
                  Connect with friends using their phone number, user ID, or QR code
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                      {isLoading ? "Sending Request..." : "Send Friend Request"}
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
                      {isLoading ? "Sending Request..." : "Send Friend Request"}
                    </Button>
                  </TabsContent>

                  <TabsContent value="qr" className="space-y-4 mt-4">
                    <div className="space-y-6">
                      {/* Scan QR Code Section */}
                      <div className="glass-panel p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                          <Camera className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-semibold">Scan QR Code</h3>
                        </div>
                        <p className="text-muted-foreground text-sm mb-4">
                          Scan a friend's QR code to send them a friend request
                        </p>
                        <Button
                          onClick={openQRScanner}
                          className="w-full hover-glow"
                          disabled={isLoading}
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Open Camera Scanner
                        </Button>
                      </div>

                      {/* My QR Code Section */}
                      <div className="glass-panel p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                          <QrCode className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-semibold">My QR Code</h3>
                        </div>
                        <p className="text-muted-foreground text-sm mb-4">
                          Share your QR code so others can add you as a friend
                        </p>
                        <div className="space-y-3">
                          <Button
                            onClick={fetchUserQRCode}
                            className="w-full hover-glow"
                          >
                            <QrCode className="w-4 h-4 mr-2" />
                            Show My QR Code
                          </Button>
                          <Button
                            onClick={copyUserIdToClipboard}
                            variant="outline"
                            className="w-full"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy My User ID
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Friend Requests Tab */}
          <TabsContent value="requests" className="space-y-6 mt-6">
            {/* Received Requests */}
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Received Requests
                  <Badge variant="secondary">{friendRequests.received.length}</Badge>
                </CardTitle>
                <CardDescription>
                  People who want to be your friend
                </CardDescription>
              </CardHeader>
              <CardContent>
                {friendRequests.received.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No pending friend requests
                  </p>
                ) : (
                  <div className="space-y-4">
                    {friendRequests.received.map((request) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 glass-panel rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <QuantumAvatar status="offline" size="md">
                            <span className="text-lg">{request.user_avatar}</span>
                          </QuantumAvatar>
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {request.user_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Sent {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptRequest(request.id)}
                            className="glass-button hover-glow"
                          >
                            <UserCheck className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeclineRequest(request.id)}
                            className="glass-button hover-glow"
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sent Requests */}
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Sent Requests
                  <Badge variant="secondary">{friendRequests.sent.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Friend requests you've sent
                </CardDescription>
              </CardHeader>
              <CardContent>
                {friendRequests.sent.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No pending sent requests
                  </p>
                ) : (
                  <div className="space-y-4">
                    {friendRequests.sent.map((request) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 glass-panel rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <QuantumAvatar status="offline" size="md">
                            <span className="text-lg">{request.user_avatar}</span>
                          </QuantumAvatar>
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {request.user_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Sent {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">Pending</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelRequest(request.id)}
                            className="glass-button hover-glow text-red-400 hover:text-red-300"
                          >
                            <UserX className="w-4 h-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Friends List Tab */}
          <TabsContent value="friends" className="space-y-6 mt-6">
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  My Friends
                  <Badge variant="secondary">{friends.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Your current friends list
                </CardDescription>
              </CardHeader>
              <CardContent>
                {friends.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No friends yet. Start by adding some friends!
                  </p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {friends.map((friend) => (
                      <motion.div
                        key={friend.friend_id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 p-4 glass-panel rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => navigate("/dashboard")}
                      >
                        <QuantumAvatar status="online" size="md">
                          <span className="text-lg">{friend.friend_avatar}</span>
                        </QuantumAvatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">
                            {friend.friend_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Friends since {new Date(friend.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>

      {/* QR Scanner Modal */}
      <QRScannerComponent
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScan}
      />

      {/* My QR Code Modal */}
      {showMyQRCode && userQRCode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowMyQRCode(false)}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="glass-panel p-6 rounded-3xl max-w-md w-full mx-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                My QR Code
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Share this QR code with friends to let them add you
              </p>
              
              <div className="bg-white p-4 rounded-xl mb-6 inline-block">
                <img 
                  src={userQRCode} 
                  alt="My QR Code" 
                  className="w-48 h-48"
                />
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={copyUserIdToClipboard}
                  variant="outline"
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy My User ID
                </Button>
                <Button
                  onClick={() => setShowMyQRCode(false)}
                  className="w-full hover-glow"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Friends;