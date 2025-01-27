import { useEffect } from "react";
import { cleanupScanner } from "@/utils/scannerUtils";
import { useScanner } from "@/hooks/useScanner";
import { useBarcodeCapture } from "@/hooks/useBarcodeCapture";
import CameraPermissionUI from "./scanner/CameraPermissionUI";
import ScannerUI from "./scanner/ScannerUI";

const BarcodeScanner = () => {
  const { 
    scanner,
    isInitializing,
    cameraPermissionDenied,
    isProcessingRef,
    initializeCamera,
    retryCamera
  } = useScanner({
    onScanSuccess: (decodedText) => barcodeCapture.handleCapture(decodedText)
  });

  const barcodeCapture = useBarcodeCapture({ isProcessingRef });

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

  if (cameraPermissionDenied) {
    return (
      <CameraPermissionUI
        onRetryCamera={retryCamera}
        onContinueWithoutCamera={barcodeCapture.handleClose}
      />
    );
  }

  return (
    <ScannerUI
      onClose={barcodeCapture.handleClose}
      isInitializing={isInitializing}
    />
  );
};

export default BarcodeScanner;