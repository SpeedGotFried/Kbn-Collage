import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface IncognitoPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const IncognitoPasswordModal = ({ isOpen, onClose, onSuccess }: IncognitoPasswordModalProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'check' | 'setup' | 'verify'>('check');
  const [hasPassword, setHasPassword] = useState(false);

  // Check if user has incognito password when modal opens
  useEffect(() => {
    if (isOpen) {
      checkIncognitoPassword();
    }
  }, [isOpen]);

  const checkIncognitoPassword = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/v1/auth/incognito/check', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setHasPassword(data.has_password);
      setMode(data.has_password ? 'verify' : 'setup');
    } catch (error) {
      console.error('Error checking incognito password:', error);
      toast.error('Failed to check incognito password status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsWrong(false);

    try {
      const token = localStorage.getItem('token');
      
      if (mode === 'setup') {
        // Setting up new password
        if (password !== confirmPassword) {
          toast.error('Passwords do not match');
          setIsLoading(false);
          return;
        }
        
        if (password.length < 6) {
          toast.error('Password must be at least 6 characters long');
          setIsLoading(false);
          return;
        }

        const response = await fetch('http://localhost:8000/v1/auth/incognito/set', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            password,
            confirm_password: confirmPassword
          })
        });

        if (response.ok) {
          toast.success('Incognito password set successfully');
          onSuccess();
          handleClose();
        } else {
          const error = await response.json();
          toast.error(error.detail || 'Failed to set password');
        }
      } else {
        // Verifying existing password
        const response = await fetch('http://localhost:8000/v1/auth/incognito/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ password })
        });

        const data = await response.json();
        
        if (data.valid) {
          onSuccess();
          handleClose();
        } else {
          setIsWrong(true);
          setTimeout(() => setIsWrong(false), 2000);
        }
      }
    } catch (error) {
      console.error('Error with incognito password:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setConfirmPassword("");
    setIsWrong(false);
    setIsLoading(false);
    setMode('check');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-panel border border-primary/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Lock className="w-5 h-5 text-primary" />
            {mode === 'setup' ? 'Setup Incognito Password' : 'Incognito Mode Access'}
          </DialogTitle>
        </DialogHeader>
        
        {isLoading && mode === 'check' ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground">
              {mode === 'setup' 
                ? 'Set up a password to enable incognito mode for secure messaging.'
                : 'Enter your password to activate incognito mode for this chat.'
              }
            </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'setup' ? 'Create password' : 'Enter password'}
                  className={`glass-panel pr-10 ${isWrong ? "border-red-500/50 shake" : ""}`}
                  autoFocus
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              
              {mode === 'setup' && (
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="glass-panel pr-10"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              )}
            
            <AnimatePresence>
              {isWrong && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm text-red-400"
                >
                  Incorrect password. Try again.
                </motion.p>
              )}
            </AnimatePresence>
            
            <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  className="glass-button"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!password.trim() || (mode === 'setup' && !confirmPassword.trim()) || isLoading}
                  className="glass-button bg-primary/20 hover:bg-primary/30"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      {mode === 'setup' ? 'Setting up...' : 'Verifying...'}
                    </div>
                  ) : (
                    mode === 'setup' ? 'Set Password' : 'Unlock'
                  )}
                </Button>
              </div>
          </form>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default IncognitoPasswordModal;