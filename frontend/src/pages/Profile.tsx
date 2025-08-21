import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, QrCode, Edit, LogOut, Shield, Key, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/ProtectedRoute";
import QuantumAvatar from "@/components/chat/QuantumAvatar";
import QRCodeGenerator from "@/components/profile/QRCodeGenerator";
// Removed API imports - using direct backend calls

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  
  const [profile, setProfile] = useState({
    name: "Your Name",
    phone: "+1234567890",
    userId: "QC-8956-4721-3847-2956",
    avatar: "🌟",
    status: "online" as const
  });

  const copyUserId = () => {
    navigator.clipboard.writeText(profile.userId);
    toast({
      title: "User ID Copied",
      description: "Your unique ID has been copied to clipboard"
    });
  };

  const handleSave = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated"
    });
  };

  const handleLogout = async () => {
    try {
      // Use auth context logout function
      logout();
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out"
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive"
      });
    }
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
        
        <h1 className="text-2xl font-bold">Profile</h1>
        
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="glass-button hover-glow text-destructive"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </motion.div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Profile Information</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="hover-glow"
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>

            {/* Avatar */}
            <div className="text-center mb-6">
              <QuantumAvatar 
                status={profile.status}
                size="xl"
                className="mx-auto mb-4"
              >
                <span className="text-4xl">{profile.avatar}</span>
              </QuantumAvatar>
              <p className="text-sm text-muted-foreground">Quantum Mood Avatar</p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({...prev, name: e.target.value}))}
                  disabled={!isEditing}
                  className="glass-panel"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  disabled
                  className="glass-panel"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Phone number cannot be changed
                </p>
              </div>

              {isEditing && (
                <Button onClick={handleSave} className="w-full glass-button hover-glow">
                  Save Changes
                </Button>
              )}
            </div>
          </div>

          {/* Security */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 glass-panel rounded-lg">
                <div>
                  <p className="font-medium">End-to-End Encryption</p>
                  <p className="text-sm text-muted-foreground">Messages are secured</p>
                </div>
                <div className="w-2 h-2 bg-quantum-online rounded-full animate-glow"></div>
              </div>
              
              <div className="flex items-center justify-between p-3 glass-panel rounded-lg">
                <div>
                  <p className="font-medium">Quantum Vault</p>
                  <p className="text-sm text-muted-foreground">Protected storage</p>
                </div>
                <Button variant="ghost" size="sm" className="hover-glow">
                  <Key className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* User ID & QR Code */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* User ID */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-4">Unique User ID</h2>
            <div className="space-y-4">
              <div className="p-4 glass-panel rounded-lg bg-muted/5">
                <p className="font-mono text-lg text-center tracking-wider">
                  {profile.userId}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={copyUserId}
                  className="flex-1 glass-button hover-glow"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy ID
                </Button>
                
                <Button
                  onClick={() => setShowQR(!showQR)}
                  variant="outline"
                  className="glass-button hover-glow"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Code
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground text-center">
                Share this ID with friends to connect on QuantumChat
              </p>
            </div>
          </div>

          {/* QR Code */}
          {showQR && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel p-6"
            >
              <h3 className="text-lg font-semibold mb-4 text-center">QR Code</h3>
              <QRCodeGenerator value={profile.userId} />
              <p className="text-sm text-muted-foreground text-center mt-4">
                Let others scan this code to add you instantly
              </p>
            </motion.div>
          )}

          {/* Quick Actions */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button variant="ghost" className="w-full justify-start glass-button hover-glow">
                💾 Export Chat History
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start glass-button hover-glow"
                onClick={() => navigate('/settings')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;