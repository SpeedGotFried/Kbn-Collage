import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, ArrowLeft, Phone, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/ProtectedRoute";
import FloatingParticles from "@/components/3d/FloatingParticles";
import UnlockAnimation from "@/components/3d/UnlockAnimation";
// Removed API imports - using direct backend calls

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [step, setStep] = useState<"phone" | "otp" | "unlocking">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      setIsLoading(true);
      try {
        // First check if phone number exists in database
        const checkResponse = await fetch("http://localhost:8000/v1/auth/check-phone", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phoneNumber: phone }),
        });
        
        if (checkResponse.ok) {
          const checkResult = await checkResponse.json();
          if (!checkResult.exists) {
            toast({
              title: "Account Not Found",
              description: "No account found with this phone number. Please sign up first.",
              variant: "destructive",
            });
            return;
          }
        } else {
          const errorData = await checkResponse.json();
          throw new Error(errorData.detail || "Failed to validate phone number");
        }
        
        // If phone exists, proceed with OTP sending
        const response = await fetch("http://localhost:8000/v1/auth/send-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phoneNumber: phone }),
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setStep("otp");
            
            // Handle different SMS scenarios
            if (result.fallbackMode) {
              toast({
                title: "OTP Generated",
                description: "SMS service is temporarily unavailable. Check the server console for your OTP code.",
                variant: "default",
              });
            } else if (result.smsStatus) {
              toast({
                title: "OTP Sent",
                description: "Verification code has been sent to your phone via SMS.",
              });
            } else {
              toast({
                title: "OTP Generated",
                description: "OTP generated but SMS delivery failed. Check the server console for your OTP code.",
                variant: "default",
              });
            }
          } else {
            throw new Error("Failed to send OTP");
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Failed to send OTP");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Network error. Please check your connection.";
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length >= 6) {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:8000/v1/auth/verify-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phoneNumber: phone, otp: otp }),
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.token) {
            // Use auth context to handle login
            const userData = {
              phone: phone,
              verified: true,
              ...result.user
            };
            login(result.token, userData);
            
            setStep("unlocking");
            setIsUnlocking(true);
            
            // Show unlock animation then redirect
            setTimeout(() => {
              navigate("/dashboard");
            }, 3000);
          } else {
            throw new Error("Invalid or expired OTP");
          }
        } else {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Invalid or expired OTP");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Network error. Please check your connection.";
        toast({
          title: "Invalid OTP",
          description: message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <Suspense fallback={null}>
            <FloatingParticles />
            {isUnlocking && <UnlockAnimation />}
          </Suspense>
        </Canvas>
      </div>

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 z-20"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="glass-button hover-glow"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <AnimatePresence mode="wait">
          {step === "phone" && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md"
            >
              <div className="glass-panel p-8 space-y-6">
                <div className="text-center">
                  <div className="glass-panel p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Phone className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Enter Your Number</h2>
                  <p className="text-muted-foreground">
                    We'll send you a verification code
                  </p>
                </div>

                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="glass-panel text-center text-lg"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full glass-button hover-glow"
                    disabled={phone.length < 10 || isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Code"}
                  </Button>
                </form>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Button
                      variant="link"
                      onClick={() => navigate("/signup")}
                      className="p-0 h-auto text-primary hover:text-primary/80"
                    >
                      Sign up
                    </Button>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md"
            >
              <div className="glass-panel p-8 space-y-6">
                <div className="text-center">
                  <div className="glass-panel p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Key className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Verification Code</h2>
                  <p className="text-muted-foreground">
                    Enter the 6-digit code sent to {phone}
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="123456"
                      className="glass-panel text-center text-2xl tracking-widest"
                      maxLength={6}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full glass-button hover-glow"
                    disabled={otp.length < 6 || isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify & Login"}
                  </Button>
                </form>

                <Button
                  variant="ghost"
                  onClick={() => setStep("phone")}
                  className="w-full text-muted-foreground"
                >
                  Change Number
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Button
                      variant="link"
                      onClick={() => navigate("/signup")}
                      className="p-0 h-auto text-primary hover:text-primary/80"
                    >
                      Sign up
                    </Button>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {step === "unlocking" && (
            <motion.div
              key="unlocking"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="glass-panel p-12 space-y-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                  className="w-24 h-24 mx-auto mb-6"
                >
                  <div className="glass-panel p-6 rounded-full hover-glow">
                    <motion.div
                      initial={{ scale: 1 }}
                      animate={{ scale: [1, 1.2, 0] }}
                      transition={{ duration: 3, ease: "easeInOut" }}
                    >
                      <Lock className="w-12 h-12 text-primary" />
                    </motion.div>
                  </div>
                </motion.div>
                
                <h2 className="text-2xl font-bold">Unlocking...</h2>
                <p className="text-muted-foreground">
                  Decrypting your quantum vault
                </p>
                
                <div className="flex justify-center space-x-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -10, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                      className="w-2 h-2 bg-primary rounded-full"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login;