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
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  const onScanSuccess = (decodedText: string) => {
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
      <CameraPermissionUI
        onRetryCamera={retryCamera}
        onContinueWithoutCamera={handleClose}
      />
    );
  }

  return (
    <ScannerUI
      onClose={handleClose}
      onCapture={handleCapture}
      isInitializing={isInitializing}
      lastScannedCode={lastScannedCode}
    />
  );
};

export default BarcodeScanner;