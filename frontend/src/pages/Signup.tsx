import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, ArrowLeft, User, Mail, Phone, Shield, CheckCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/ProtectedRoute";
import FloatingParticles from "@/components/3d/FloatingParticles";

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: ""
  });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"signup" | "otp" | "success">("signup");
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Step 1: Check if phone number already exists
      const checkResponse = await fetch('http://localhost:8000/v1/auth/check-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formData.phoneNumber
        }),
      });
      
      const checkData = await checkResponse.json();
      
      if (!checkResponse.ok) {
        throw new Error(checkData.detail || 'Failed to check phone number');
      }
      
      if (checkData.exists) {
        toast({
          title: "Account Already Exists",
          description: "You already have an account. Try logging in instead.",
          variant: "destructive",
        });
        // Redirect to login page
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }
      
      // Step 2: Create user account
      const signupResponse = await fetch('http://localhost:8000/v1/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber
        }),
      });
      
      const signupData = await signupResponse.json();
      
      if (!signupResponse.ok) {
        throw new Error(signupData.detail || 'Signup failed');
      }
      
      setUserData(signupData.user);
      
      // Step 3: Send OTP to phone number
      const otpResponse = await fetch('http://localhost:8000/v1/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formData.phoneNumber
        }),
      });
      
      const otpData = await otpResponse.json();
      
      if (!otpResponse.ok) {
        throw new Error(otpData.detail || 'Failed to send OTP');
      }
      
      // Handle different SMS scenarios
      if (otpData.fallbackMode) {
        toast({
          title: "Account Created!",
          description: "SMS service is temporarily unavailable. Check the server console for your OTP code.",
        });
      } else if (otpData.smsStatus) {
        toast({
          title: "Account Created!",
          description: "Please verify your phone number with the OTP sent to you via SMS.",
        });
      } else {
        toast({
          title: "Account Created!",
          description: "OTP generated but SMS delivery failed. Check the server console for your OTP code.",
        });
      }
      
      setStep("otp");
      
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create account. Please try again.";
      toast({
        title: "Signup Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/v1/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formData.phoneNumber,
          otp: otp
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'OTP verification failed');
      }
      
      // Use auth context to handle login
      const userData = {
        phone: formData.phoneNumber,
        email: formData.email,
        fullName: formData.fullName,
        verified: true,
        ...data.user
      };
      login(data.access_token, userData);
      
      toast({
        title: "Welcome!",
        description: "Your account has been verified successfully.",
      });
      
      setStep("success");
      
      // Redirect to profile after a short delay
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : "OTP verification failed. Please try again.";
      toast({
        title: "Verification Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const resendOtp = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/v1/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formData.phoneNumber
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Handle different SMS scenarios for resend
        if (result.fallbackMode) {
          toast({
            title: "OTP Resent",
            description: "SMS service is temporarily unavailable. Check the server console for your new OTP code.",
          });
        } else if (result.smsStatus) {
          toast({
            title: "OTP Resent",
            description: "A new OTP has been sent to your phone number via SMS.",
          });
        } else {
          toast({
            title: "OTP Resent",
            description: "New OTP generated but SMS delivery failed. Check the server console for your OTP code.",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Failed to Resend",
        description: "Could not resend OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.fullName && formData.email && formData.phoneNumber;
  const isOtpValid = otp.length === 6;

  const renderStepContent = () => {
    switch (step) {
      case "signup":
        return (
          <>
            <div className="text-center">
              <div className="glass-panel p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Create Account</h2>
              <p className="text-muted-foreground">
                Join the quantum communication network
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="glass-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="glass-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="glass-input"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full glass-button hover-glow"
                disabled={!isFormValid || isLoading}
               >
                 {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending OTP...
                  </div>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Button
                  variant="link"
                  onClick={() => navigate("/login")}
                  className="text-primary p-0 h-auto font-normal"
                >
                  Sign in here
                </Button>
              </p>
            </div>
          </>
        );

      case "otp":
        return (
          <>
            <div className="text-center">
              <div className="glass-panel p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Verify Phone Number</h2>
              <p className="text-muted-foreground mb-4">
                Enter the 6-digit code sent to {formData.phoneNumber}
              </p>
            </div>

            <form onSubmit={handleOtpVerification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="glass-input text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full glass-button hover-glow"
                disabled={!isOtpValid || isLoading}
               >
                 {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  "Verify & Create Account"
                )}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <Button
                variant="ghost"
                onClick={resendOtp}
                disabled={isLoading}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Didn't receive the code? Resend OTP
              </Button>
              <Button
                variant="ghost"
                onClick={() => setStep("signup")}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Change phone number
              </Button>
            </div>
          </>
        );

      case "success":
        return (
          <>
            <div className="text-center">
              <div className="glass-panel p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Account Created!</h2>
              <p className="text-muted-foreground mb-6">
                Welcome to the quantum communication network, {userData?.full_name}!
              </p>
            </div>

            <Button
              onClick={() => navigate("/profile")}
              className="w-full glass-button hover-glow"
            >
              Continue to Profile
            </Button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <Suspense fallback={null}>
            <FloatingParticles />
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
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="glass-panel p-8 space-y-6">
              {renderStepContent()}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Signup;