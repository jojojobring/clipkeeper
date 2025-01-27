import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";
import { requestCameraPermission } from "@/utils/cameraUtils";
import { getScannerConfig, cleanupScanner } from "@/utils/scannerUtils";
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
  const isProcessingRef = useRef(false);

  const handleCapture = async (decodedText: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    
    console.log("Handling capture for:", decodedText);
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
  };

  const onScanSuccess = (decodedText: string) => {
    console.log("Scan successful:", decodedText);
    handleCapture(decodedText);
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

      const html5QrCode = new Html5Qrcode("reader", { verbose: false });
      setScanner(html5QrCode);

      const config = getScannerConfig();

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
      isProcessingRef.current = false;
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