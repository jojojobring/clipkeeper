import { useState, useEffect, useCallback, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface UseScannerProps {
  onScanSuccess: (result: string) => void;
  onScanError: (error: Error) => void;
}

export const useScanner = ({ onScanSuccess, onScanError }: UseScannerProps) => {
  const [error, setError] = useState<Error | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);

  const initializeScanner = useCallback(async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
      }

      const scanner = new Html5Qrcode('reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 100 },
          aspectRatio: window.innerWidth / window.innerHeight,
          formatsToSupport: ["CODE_128"],
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          }
        },
        (decodedText) => {
          if (!isProcessingRef.current) {
            isProcessingRef.current = true;
            onScanSuccess(decodedText);
          }
        },
        (errorMessage) => {
          // Ignore non-critical errors (like no barcode found)
          if (!errorMessage.includes('No barcode detected')) {
            console.warn('Scanner warning:', errorMessage);
          }
        }
      );

      setError(null);
    } catch (err) {
      console.error('Scanner initialization error:', err);
      setError(err instanceof Error ? err : new Error('Failed to initialize scanner'));
      onScanError(err instanceof Error ? err : new Error('Failed to initialize scanner'));
    }
  }, [onScanSuccess, onScanError]);

  const cleanup = useCallback(() => {
    if (scannerRef.current) {
      console.log('Cleaning up scanner...');
      scannerRef.current.stop()
        .then(() => {
          scannerRef.current = null;
          isProcessingRef.current = false;
        })
        .catch(console.error);
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    error,
    initializeScanner,
    cleanup
  };
};