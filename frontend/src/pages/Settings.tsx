import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, User, Palette, Shield, Bell, Moon, Sun, Volume2, VolumeX, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import QuantumAvatar from "@/components/chat/QuantumAvatar";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  
  const [profile, setProfile] = useState({
    name: "You",
    status: "Living in the quantum realm of digital communication ✨",
    avatar: "🌟"
  });
  
  const [privacy, setPrivacy] = useState({
    hideLastSeen: false,
    hideStatus: false,
    readReceipts: true
  });
  
  const [notifications, setNotifications] = useState({
    soundEnabled: true,
    vibration: true,
    showPreviews: true
  });
  
  const [theme, setTheme] = useState("light");

  const avatarOptions = ["🌟", "🌙", "🚀", "🌌", "💫", "⭐", "🔥", "💎", "🦋", "🌈"];

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
    toast({
      title: "Profile Updated",
      description: "Your profile settings have been saved"
    });
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast({
      title: "Theme Changed",
      description: `Switched to ${newTheme} theme`
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
        
        <h1 className="text-2xl font-bold">Settings</h1>
        
        <div className="w-[120px]"></div> {/* Spacer for centering */}
      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Profile Settings */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <User className="w-5 h-5 mr-2" />
                Profile Settings
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="hover-glow"
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditingProfile ? "Cancel" : "Edit"}
              </Button>
            </div>

            {/* Avatar */}
            <div className="text-center mb-6">
              <QuantumAvatar 
                status="online"
                size="xl"
                className="mx-auto mb-4"
              >
                <span className="text-4xl">{profile.avatar}</span>
              </QuantumAvatar>
              <p className="text-sm text-muted-foreground">Quantum Mood Avatar</p>
            </div>

            {/* Profile Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-base font-semibold">Display Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  disabled={!isEditingProfile}
                  className="glass-panel h-12 text-base font-medium rounded-xl border-0 focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter your display name"
                />
              </div>
              
              <div>
                <Label htmlFor="status" className="text-base font-semibold">Status Message</Label>
                <Textarea
                  id="status"
                  value={profile.status}
                  onChange={(e) => setProfile({ ...profile, status: e.target.value })}
                  disabled={!isEditingProfile}
                  className="glass-panel resize-none text-base font-medium rounded-xl border-0 focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                  rows={4}
                  placeholder="Share what's on your mind..."
                />
              </div>
              
              {isEditingProfile && (
                <>
                  <div>
                    <Label className="text-base font-semibold">Choose Avatar</Label>
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 w-full mt-3">
                      {avatarOptions.map((emoji, index) => (
                        <motion.div
                          key={emoji}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Button
                            variant="ghost"
                            onClick={() => setProfile({ ...profile, avatar: emoji })}
                            className={`glass-panel aspect-square text-2xl sm:text-3xl hover-glow rounded-2xl transition-all duration-200 w-full min-w-0 ${
                              profile.avatar === emoji ? 'ring-2 ring-primary shadow-lg scale-105' : 'hover:scale-105'
                            }`}
                          >
                            {emoji}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleSaveProfile} 
                    className="w-full glass-button hover-glow h-12 text-base font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02]"
                  >
                    Save Profile Changes
                  </Button>
                </>
              )}
            </div>
          </motion.div>

          {/* Theme Settings */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-6"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Theme Settings
            </h2>
            
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold">Theme Selection</Label>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger className="glass-panel h-12 text-base font-medium rounded-xl border-0 focus:ring-2 focus:ring-primary/50 mt-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-0 rounded-xl">
                    <SelectItem value="light" className="text-base font-medium py-3">
                      <div className="flex items-center">
                        <Sun className="w-5 h-5 mr-3" />
                        Light Beige
                      </div>
                    </SelectItem>
                    <SelectItem value="dark" className="text-base font-medium py-3">
                      <div className="flex items-center">
                        <Moon className="w-5 h-5 mr-3" />
                        Dark Mode
                      </div>
                    </SelectItem>
                    <SelectItem value="quantum" className="text-base font-medium py-3">
                      <div className="flex items-center">
                        <span className="w-5 h-5 mr-3 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></span>
                        Quantum Glow
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-lg font-semibold mb-4">Theme Preview</h3>
                <div className="grid grid-cols-3 gap-4">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="aspect-square bg-primary/20 rounded-xl shadow-sm"
                  ></motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="aspect-square bg-secondary/20 rounded-xl shadow-sm"
                  ></motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="aspect-square bg-accent/20 rounded-xl shadow-sm"
                  ></motion.div>
                </div>
                <p className="text-sm text-muted-foreground mt-4 font-medium">Preview how your theme will look across the app</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Privacy Settings */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-6"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Privacy Settings
            </h2>
            
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-between glass-panel p-4 rounded-2xl hover:shadow-lg transition-all duration-200"
              >
                <div>
                  <h3 className="text-base font-semibold">Hide Last Seen</h3>
                  <p className="text-sm text-muted-foreground">Don't show when you were last online</p>
                </div>
                <Switch
                  checked={privacy.hideLastSeen}
                  onCheckedChange={(checked) => setPrivacy({ ...privacy, hideLastSeen: checked })}
                  className="data-[state=checked]:bg-primary"
                />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-between glass-panel p-4 rounded-2xl hover:shadow-lg transition-all duration-200"
              >
                <div>
                  <h3 className="text-base font-semibold">Hide Status</h3>
                  <p className="text-sm text-muted-foreground">Don't show your status message to others</p>
                </div>
                <Switch
                  checked={privacy.hideStatus}
                  onCheckedChange={(checked) => setPrivacy({ ...privacy, hideStatus: checked })}
                  className="data-[state=checked]:bg-primary"
                />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-between glass-panel p-4 rounded-2xl hover:shadow-lg transition-all duration-200"
              >
                <div>
                  <h3 className="text-base font-semibold">Read Receipts</h3>
                  <p className="text-sm text-muted-foreground">Show when you've read messages</p>
                </div>
                <Switch
                  checked={privacy.readReceipts}
                  onCheckedChange={(checked) => setPrivacy({ ...privacy, readReceipts: checked })}
                  className="data-[state=checked]:bg-primary"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button 
                  variant="destructive" 
                  className="w-full glass-button h-12 text-base font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02]"
                >
                  View Blocked Users
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel p-6"
          >
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notification Settings
            </h2>
            
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-between glass-panel p-4 rounded-2xl hover:shadow-lg transition-all duration-200"
              >
                <div>
                  <h3 className="text-base font-semibold flex items-center">
                    {notifications.soundEnabled ? <Volume2 className="w-5 h-5 mr-3" /> : <VolumeX className="w-5 h-5 mr-3" />}
                    Sound Notifications
                  </h3>
                  <p className="text-sm text-muted-foreground">Play sound for new messages</p>
                </div>
                <Switch
                  checked={notifications.soundEnabled}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, soundEnabled: checked })}
                  className="data-[state=checked]:bg-primary"
                />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-between glass-panel p-4 rounded-2xl hover:shadow-lg transition-all duration-200"
              >
                <div>
                  <h3 className="text-base font-semibold">Vibration</h3>
                  <p className="text-sm text-muted-foreground">Vibrate for notifications</p>
                </div>
                <Switch
                  checked={notifications.vibration}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, vibration: checked })}
                  className="data-[state=checked]:bg-primary"
                />
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-between glass-panel p-4 rounded-2xl hover:shadow-lg transition-all duration-200"
              >
                <div>
                  <h3 className="text-base font-semibold">Message Previews</h3>
                  <p className="text-sm text-muted-foreground">Show message content in notifications</p>
                </div>
                <Switch
                  checked={notifications.showPreviews}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, showPreviews: checked })}
                  className="data-[state=checked]:bg-primary"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;