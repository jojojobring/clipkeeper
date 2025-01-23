import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";
import { requestCameraPermission } from "@/utils/cameraUtils";
import { loadScannerScript, getScannerConfig, cleanupScanner } from "@/utils/scannerUtils";

declare global {
  interface Window {
    Html5Qrcode: any;
  }
}

const BarcodeScanner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scanner, setScanner] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeCamera = async () => {
      try {
        // Check camera permissions
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
          toast.error("Please allow camera access to scan barcodes");
          setIsInitializing(false);
          return;
        }

        // Load scanner script
        await loadScannerScript();
        if (!mounted) return;

        // Initialize scanner
        const html5QrCode = new window.Html5Qrcode("reader", { verbose: false });
        setScanner(html5QrCode);

        await html5QrCode.start(
          { facingMode: "environment" },
          getScannerConfig(),
          onScanSuccess,
          onScanFailure
        );

        setIsInitializing(false);
      } catch (error) {
        console.error("Scanner initialization error:", error);
        if (mounted) {
          toast.error("Failed to start camera. Please try again.");
          setIsInitializing(false);
        }
      }
    };

    initializeCamera();

    return () => {
      mounted = false;
      cleanupScanner(scanner);
    };
  }, []);

  const onScanSuccess = async (decodedText: string) => {
    if (scanner) {
      try {
        await scanner.stop();
        const currentItems = location.state?.items || [];
        const newItem = { code: decodedText, qty: "" };
        
        toast.success("Barcode scanned successfully!");
        
        navigate("/items", {
          state: {
            ...location.state,
            items: [...currentItems, newItem],
          },
        });
      } catch (err) {
        console.error("Error stopping scanner:", err);
        toast.error("Error processing scan. Please try again.");
      }
    }
  };

  const onScanFailure = (error: any) => {
    // Silent failure is fine for scanning attempts
    console.debug("Scan failure:", error);
  };

  const handleClose = () => {
    cleanupScanner(scanner);
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-black relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white z-10"
        onClick={handleClose}
      >
        <X className="h-6 w-6" />
      </Button>
      
      {isInitializing && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          Initializing camera...
        </div>
      )}
      
      <div id="reader" className="w-full h-screen" />
    </div>
  );
};

export default BarcodeScanner;