import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const WaveBackground = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create wave geometry
  const geometry = new THREE.PlaneGeometry(20, 20, 50, 50);
  const positions = geometry.attributes.position;

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      
      // Animate vertices for wave effect
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        
        const waveHeight = Math.sin(x * 0.5 + time) * Math.cos(y * 0.5 + time) * 0.3;
        positions.setZ(i, waveHeight);
      }
      
      positions.needsUpdate = true;
      geometry.computeVertexNormals();
      
      // Rotate the entire mesh slowly
      meshRef.current.rotation.z += 0.002;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -5]} rotation={[0, 0, 0]}>
      <primitive object={geometry} />
      <meshBasicMaterial
        color="#F5F0E8"
        transparent
        opacity={0.1}
        wireframe
      />
    </mesh>
  );
};

export default WaveBackground;