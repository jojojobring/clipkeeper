import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { requestCameraPermission } from "@/utils/cameraUtils";
import { loadScannerScript, getScannerConfig, cleanupScanner } from "@/utils/scannerUtils";
import CameraPermissionUI from "./scanner/CameraPermissionUI";
import ScannerUI from "./scanner/ScannerUI";

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

  const handleCapture = async (decodedText: string) => {
    if (scanner) {
      try {
        await scanner.stop();
        const currentItems = location.state?.items || [];
        const newItem = { code: decodedText, qty: "" };
        
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

  const onScanSuccess = (decodedText: string) => {
    console.log("Scan successful:", decodedText);
    handleCapture(decodedText);
  };

  const onScanFailure = (error: any) => {
    // Only log scan failures for debugging
    console.debug("Scan failure:", error);
  };

  const initializeCamera = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        setCameraPermissionDenied(true);
        setIsInitializing(false);
        return;
      }

      await loadScannerScript();
      const html5QrCode = new window.Html5Qrcode("reader", { verbose: false });
      setScanner(html5QrCode);

      const config = {
        ...getScannerConfig(),
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
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
      <CameraPermissionUI
        onRetryCamera={retryCamera}
        onContinueWithoutCamera={handleClose}
      />
    );
  }

  return (
    <ScannerUI
      onClose={handleClose}
      isInitializing={isInitializing}
    />
  );
};

export default BarcodeScanner;