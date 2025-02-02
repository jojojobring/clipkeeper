import { useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { getScannerConfig } from "@/utils/scannerUtils";
import { requestCameraPermission } from "@/utils/cameraUtils";

interface UseScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

export const useScanner = ({ onScanSuccess }: UseScannerProps) => {
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false);
  const isProcessingRef = useRef(false);

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

  const retryCamera = async () => {
    setIsInitializing(true);
    setCameraPermissionDenied(false);
    await initializeCamera();
  };

  return {
    scanner,
    isInitializing,
    cameraPermissionDenied,
    isProcessingRef,
    initializeCamera,
    retryCamera
  };
};