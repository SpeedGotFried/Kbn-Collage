import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import FloatingParticles from "@/components/3d/FloatingParticles";
import WaveBackground from "@/components/3d/WaveBackground";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <Suspense fallback={null}>
            <WaveBackground />
            <FloatingParticles />
          </Suspense>
        </Canvas>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
            className="mb-8 flex justify-center"
          >
            <div className="glass-panel p-6 rounded-full hover-glow">
              <MessageCircle className="w-16 h-16 text-primary" />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="text-6xl md:text-8xl font-bold mb-6 
           bg-gradient-to-r from-[#9d673a] from-15% 
           to-[#deac76] to-85% 
           bg-clip-text text-transparent"
          >
            QuantumChat
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-xl md:text-2xl text-muted-foreground mb-8 font-light"
          >
            Experience the future of messaging with immersive 3D effects
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <div className="glass-panel p-6 hover-lift">
              <Sparkles className="w-8 h-8 text-primary mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Quantum Avatars</h3>
              <p className="text-muted-foreground text-sm">
                Mood-reactive 3D avatars that glow based on status
              </p>
            </div>
            <div className="glass-panel p-6 hover-lift">
              <MessageCircle className="w-8 h-8 text-primary mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Teleport Messages</h3>
              <p className="text-muted-foreground text-sm">
                Watch your messages fly like comets across the screen
              </p>
            </div>
            <div className="glass-panel p-6 hover-lift">
              <Lock className="w-8 h-8 text-primary mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Encrypted Files</h3>
              <p className="text-muted-foreground text-sm">
                3D encrypted cubes that unfold to reveal your files
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={() => navigate("/login")}
              size="lg"
              className="glass-button text-lg px-8 py-4 hover-glow bg-[#deac76]"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate("/signup")}
              variant="outline"
              size="lg"
              className="glass-button text-lg px-8 py-4 hover-glow"
            >
              Sign Up
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;