import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
}

const QRCodeGenerator = ({ value, size = 200 }: QRCodeGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Simple QR code visualization (simplified for demo)
    const cellSize = size / 21; // 21x21 grid for QR code
    
    ctx.fillStyle = "#F5F0E8";
    ctx.fillRect(0, 0, size, size);
    
    // Generate a pattern based on the value
    ctx.fillStyle = "#3D352B";
    
    // Create QR-like pattern
    for (let row = 0; row < 21; row++) {
      for (let col = 0; col < 21; col++) {
        // Generate pseudo-random pattern based on value and position
        const hash = (value + row + col).split("").reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0);
          return a & a;
        }, 0);
        
        if (Math.abs(hash) % 3 === 0) {
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
      }
    }
    
    // Add finder patterns (corners)
    const drawFinderPattern = (x: number, y: number) => {
      // Outer square
      ctx.fillRect(x, y, cellSize * 7, cellSize * 7);
      ctx.fillStyle = "#F5F0E8";
      ctx.fillRect(x + cellSize, y + cellSize, cellSize * 5, cellSize * 5);
      ctx.fillStyle = "#3D352B";
      ctx.fillRect(x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3);
    };
    
    drawFinderPattern(0, 0); // Top-left
    drawFinderPattern(14 * cellSize, 0); // Top-right  
    drawFinderPattern(0, 14 * cellSize); // Bottom-left

  }, [value, size]);

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="flex justify-center"
    >
      <div className="glass-panel p-4 rounded-2xl hover-glow">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="rounded-lg"
        />
      </div>
    </motion.div>
  );
};

export default QRCodeGenerator;