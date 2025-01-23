import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { requestCameraPermission } from "@/utils/cameraUtils";
import { initializeScanner, cleanupScanner } from "@/utils/scannerUtils";
import CameraPermissionUI from "./scanner/CameraPermissionUI";
import ScannerUI from "./scanner/ScannerUI";

const BarcodeScanner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitializing, setIsInitializing] = useState(true);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);

  const onDetected = (code: string) => {
    setLastScannedCode(code);
    toast.success("Barcode detected! Click capture to confirm.");
  };

  const handleCapture = () => {
    if (!lastScannedCode) {
      toast.error("No barcode detected. Please scan again.");
      return;
    }

    cleanupScanner();
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
  };

  const initializeCamera = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        setCameraPermissionDenied(true);
        setIsInitializing(false);
        return;
      }

      initializeScanner(onDetected);
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
      cleanupScanner();
    };
  }, []);

  const handleClose = () => {
    cleanupScanner();
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