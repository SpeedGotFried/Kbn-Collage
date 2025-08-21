import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const UnlockAnimation = () => {
  const lockRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  
  // Create particles for unlock effect
  const particleCount = 100;
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 2;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
    
    velocities[i * 3] = (Math.random() - 0.5) * 0.02;
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
  }

  useFrame((state, delta) => {
    if (lockRef.current) {
      // Rotate lock
      lockRef.current.rotation.y += delta * 2;
      
      // Scale animation (shrink and disappear)
      const scale = Math.max(0, 1 - state.clock.elapsedTime / 3);
      lockRef.current.scale.setScalar(scale);
    }
    
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      // Animate particles exploding outward
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i] * delta * 60;
        positions[i + 1] += velocities[i + 1] * delta * 60;
        positions[i + 2] += velocities[i + 2] * delta * 60;
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Lock */}
      <group ref={lockRef}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.1, 8]} />
          <meshBasicMaterial color="#D4C2A0" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.8, 0.6, 0.3]} />
          <meshBasicMaterial color="#D4C2A0" />
        </mesh>
      </group>
      
      {/* Explosion particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#D4C2A0"
          size={0.1}
          transparent
          opacity={0.8}
        />
      </points>
    </group>
  );
};

export default UnlockAnimation;