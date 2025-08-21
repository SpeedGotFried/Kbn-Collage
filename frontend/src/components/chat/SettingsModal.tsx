import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Palette, Shield, Bell, Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
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
  const { toast } = useToast();

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile settings have been saved"
    });
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    // In a real app, this would update the global theme
    toast({
      title: "Theme Changed",
      description: `Switched to ${newTheme} theme`
    });
  };

  const avatarOptions = ["🌟", "🌙", "🚀", "🌌", "💫", "⭐", "🔥", "💎", "🦋", "🌈"];

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
            className="glass-panel p-6 rounded-3xl max-w-3xl w-full mx-auto relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 hover-glow z-10"
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Header */}
            <div className="text-center mb-8">
              <motion.h2 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-3xl font-bold text-foreground tracking-tight"
              >
                Settings
              </motion.h2>
              <motion.p 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground text-base mt-3 font-medium"
              >
                Customize your QuantumChat experience
              </motion.p>
            </div>

            {/* Settings Tabs */}
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="flex flex-wrap w-full glass-panel p-2 rounded-2xl mb-6 gap-1 min-h-fit">
                <TabsTrigger 
                  value="profile" 
                  className="flex-1 min-w-fit data-[state=active]:bg-primary/20 data-[state=active]:shadow-lg rounded-xl py-3 px-4 font-semibold text-sm transition-all duration-200"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="theme" 
                  className="flex-1 min-w-fit data-[state=active]:bg-primary/20 data-[state=active]:shadow-lg rounded-xl py-3 px-4 font-semibold text-sm transition-all duration-200"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Theme
                </TabsTrigger>
                <TabsTrigger 
                  value="privacy" 
                  className="flex-1 min-w-fit data-[state=active]:bg-primary/20 data-[state=active]:shadow-lg rounded-xl py-3 px-4 font-semibold text-sm transition-all duration-200"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="flex-1 min-w-fit data-[state=active]:bg-primary/20 data-[state=active]:shadow-lg rounded-xl py-3 px-4 font-semibold text-sm transition-all duration-200"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-8 mt-2">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-base font-semibold text-foreground">Display Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="glass-panel h-12 text-base font-medium rounded-xl border-0 focus:ring-2 focus:ring-primary/50"
                      placeholder="Enter your display name"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="status" className="text-base font-semibold text-foreground">Status Message</Label>
                    <Textarea
                      id="status"
                      value={profile.status}
                      onChange={(e) => setProfile({ ...profile, status: e.target.value })}
                      className="glass-panel resize-none text-base font-medium rounded-xl border-0 focus:ring-2 focus:ring-primary/50 min-h-[100px]"
                      rows={4}
                      placeholder="Share what's on your mind..."
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <Label className="text-base font-semibold text-foreground">Choose Avatar</Label>
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 w-full">
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
                </motion.div>
              </TabsContent>

              {/* Theme Tab */}
              <TabsContent value="theme" className="space-y-8 mt-2">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <Label className="text-base font-semibold text-foreground">Theme Selection</Label>
                    <Select value={theme} onValueChange={handleThemeChange}>
                      <SelectTrigger className="glass-panel h-12 text-base font-medium rounded-xl border-0 focus:ring-2 focus:ring-primary/50">
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
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Theme Preview</h3>
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
                </motion.div>
              </TabsContent>

              {/* Privacy Tab */}
              <TabsContent value="privacy" className="space-y-8 mt-2">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center justify-between glass-panel p-6 rounded-2xl hover:shadow-lg transition-all duration-200"
                  >
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-foreground">Hide Last Seen</h3>
                      <p className="text-sm text-muted-foreground font-medium">Don't show when you were last online</p>
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
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-between glass-panel p-6 rounded-2xl hover:shadow-lg transition-all duration-200"
                  >
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-foreground">Hide Status</h3>
                      <p className="text-sm text-muted-foreground font-medium">Don't show your status message to others</p>
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
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-between glass-panel p-6 rounded-2xl hover:shadow-lg transition-all duration-200"
                  >
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-foreground">Read Receipts</h3>
                      <p className="text-sm text-muted-foreground font-medium">Show when you've read messages</p>
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
                    transition={{ delay: 0.4 }}
                  >
                    <Button 
                      variant="destructive" 
                      className="w-full glass-button h-12 text-base font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02]"
                    >
                      View Blocked Users
                    </Button>
                  </motion.div>
                </motion.div>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-8 mt-2">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center justify-between glass-panel p-6 rounded-2xl hover:shadow-lg transition-all duration-200"
                  >
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold flex items-center text-foreground">
                        {notifications.soundEnabled ? <Volume2 className="w-5 h-5 mr-3" /> : <VolumeX className="w-5 h-5 mr-3" />}
                        Sound Notifications
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium">Play sound for new messages</p>
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
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-between glass-panel p-6 rounded-2xl hover:shadow-lg transition-all duration-200"
                  >
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-foreground">Vibration</h3>
                      <p className="text-sm text-muted-foreground font-medium">Vibrate for notifications</p>
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
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-between glass-panel p-6 rounded-2xl hover:shadow-lg transition-all duration-200"
                  >
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold text-foreground">Message Previews</h3>
                      <p className="text-sm text-muted-foreground font-medium">Show message content in notifications</p>
                    </div>
                    <Switch
                      checked={notifications.showPreviews}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, showPreviews: checked })}
                      className="data-[state=checked]:bg-primary"
                    />
                  </motion.div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;