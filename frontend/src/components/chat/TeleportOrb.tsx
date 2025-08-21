import { motion } from "framer-motion";

const TeleportOrb = () => {
  return (
    <motion.div
      className="fixed z-50 pointer-events-none"
      initial={{ 
        top: "50%", 
        left: "20%", 
        scale: 1,
        opacity: 1 
      }}
      animate={{
        top: "20%",
        left: "80%", 
        scale: 0.1,
        opacity: 0
      }}
      transition={{
        duration: 0.8,
        ease: "easeOut"
      }}
    >
      <div className="teleport-orb w-6 h-6 rounded-full relative">
        {/* Orb Core */}
        <div className="absolute inset-0 bg-gradient-to-r from-quantum-online via-quantum-typing to-mood-excited rounded-full animate-glow" />
        
        {/* Particle Trail */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary rounded-full"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
                x: Math.random() * 20 - 10,
                y: Math.random() * 20 - 10
              }}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                repeat: 2
              }}
            />
          ))}
        </div>
        
        {/* Comet Tail */}
        <motion.div
          className="absolute -left-8 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
          initial={{ width: 0 }}
          animate={{ width: 32 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        />
      </div>
    </motion.div>
  );
};

export default TeleportOrb;