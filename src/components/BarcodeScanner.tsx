import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { X, Camera } from "lucide-react";
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
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  const onScanSuccess = (decodedText: string) => {
    // Store the scanned code but don't navigate yet
    setLastScannedCode(decodedText);
    toast.success("Barcode detected! Click capture to confirm.");
  };

  const handleCapture = async () => {
    if (!lastScannedCode) {
      toast.error("No barcode detected. Please scan again.");
      return;
    }

    if (scanner) {
      try {
        await scanner.stop();
        const currentItems = location.state?.items || [];
        const newItem = { code: lastScannedCode, qty: "" };
        
        toast.success("Barcode captured successfully!");
        
        navigate("/items", {
          state: {
            ...location.state,
            items: [...currentItems, newItem],
            cameraPermissionDenied: false
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

  const initializeCamera = async () => {
    try {
      // Check camera permissions
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        setCameraPermissionDenied(true);
        setIsInitializing(false);
        return;
      }

      // Load scanner script
      await loadScannerScript();

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
      setCameraPermissionDenied(true);
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      if (mounted) {
        await initializeCamera();
      }
    };

    setup();

    return () => {
      mounted = false;
      cleanupScanner(scanner);
    };
  }, []);

  const handleClose = () => {
    cleanupScanner(scanner);
    navigate("/items", {
      state: {
        ...location.state,
        cameraPermissionDenied: true
      }
    });
  };

  const retryCamera = async () => {
    setIsInitializing(true);
    setCameraPermissionDenied(false);
    await initializeCamera();
  };

  if (cameraPermissionDenied) {
    return (
      <div className="min-h-screen bg-white p-4 flex flex-col items-center justify-center">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold mb-2">Camera Access Required</h2>
          <p className="text-gray-600">
            Please enable camera access to scan barcodes. You can proceed without camera access and enter codes manually.
          </p>
        </div>
        <div className="space-y-4 w-full max-w-md">
          <Button onClick={retryCamera} className="w-full">
            <Camera className="mr-2 h-4 w-4" />
            Try Camera Again
          </Button>
          <Button onClick={handleClose} variant="outline" className="w-full">
            Continue Without Camera
          </Button>
        </div>
      </div>
    );
  }

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

      <Button
        onClick={handleCapture}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full w-16 h-16 p-0"
        disabled={!lastScannedCode}
      >
        <Camera className="h-8 w-8" />
      </Button>
    </div>
  );
};

export default BarcodeScanner;