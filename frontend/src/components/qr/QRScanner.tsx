import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import QrScanner from "qr-scanner";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: string) => void;
}

const QRScannerComponent = ({ isOpen, onClose, onScan }: QRScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanner, setScanner] = useState<QrScanner | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen || !videoRef.current) return;

    const initScanner = async () => {
      try {
        // First, explicitly request camera permission
        setHasPermission(null); // Set to loading state
        
        // Check if camera is available
        const hasCamera = await QrScanner.hasCamera();
        if (!hasCamera) {
          setHasPermission(false);
          toast({
            title: "No Camera Found",
            description: "No camera device found on this device",
            variant: "destructive"
          });
          return;
        }

        // Request camera permission explicitly
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          // Stop the stream immediately as we just needed permission
          stream.getTracks().forEach(track => track.stop());
        } catch (permissionError) {
          console.error('Camera permission denied:', permissionError);
          setHasPermission(false);
          toast({
            title: "Camera Permission Required",
            description: "Please allow camera access in your browser settings and refresh the page",
            variant: "destructive"
          });
          return;
        }

        // Create scanner instance
        const qrScanner = new QrScanner(
          videoRef.current!,
          (result) => {
            if (result?.data) {
              // Extract 16-digit user ID from QR code
              const userId = extractUserIdFromQR(result.data);
              if (userId) {
                onScan(userId);
                onClose();
                toast({
                  title: "QR Code Scanned!",
                  description: `Found user ID: ${userId}`
                });
              } else {
                toast({
                  title: "Invalid QR Code",
                  description: "This QR code doesn't contain a valid user ID",
                  variant: "destructive"
                });
              }
            }
          },
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: 'environment' // Use back camera if available
          }
        );

        setScanner(qrScanner);
        
        // Start scanning
        await qrScanner.start();
        setHasPermission(true);
        setIsScanning(true);
        
      } catch (error) {
        console.error('Scanner initialization failed:', error);
        setHasPermission(false);
        toast({
          title: "Camera Access Error",
          description: "Failed to access camera. Please check your browser settings and try again.",
          variant: "destructive"
        });
      }
    };

    initScanner();

    return () => {
      if (scanner) {
        scanner.stop();
        scanner.destroy();
      }
    };
  }, [isOpen, onScan, onClose, toast]);

  const extractUserIdFromQR = (data: string): string | null => {
    // Check if it's a 16-digit number
    const match = data.match(/\b\d{16}\b/);
    return match ? match[0] : null;
  };

  const handleClose = () => {
    if (scanner) {
      scanner.stop();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className="glass-panel p-6 rounded-3xl max-w-md w-full mx-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="absolute top-4 right-4 hover-glow z-10"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-block glass-panel p-4 rounded-full mb-4"
          >
            <Camera className="w-8 h-8 text-primary" />
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Scan QR Code
          </h2>
          <p className="text-muted-foreground text-sm">
            Point your camera at a friend's QR code
          </p>
        </div>

        {/* Camera View */}
        <div className="relative mb-6">
          {hasPermission === null && (
            <div className="aspect-square bg-muted/20 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Requesting camera access...</p>
              </div>
            </div>
          )}
          
          {hasPermission === false && (
            <div className="aspect-square bg-muted/20 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-2" />
                <p className="text-destructive font-medium mb-2">Camera Access Denied</p>
                <p className="text-muted-foreground text-sm">
                  Please allow camera access in your browser settings
                </p>
              </div>
            </div>
          )}
          
          {hasPermission === true && (
            <div className="relative aspect-square rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-primary rounded-lg w-48 h-48 relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Position the QR code within the frame to scan
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QRScannerComponent;