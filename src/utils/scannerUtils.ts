const SCANNER_SCRIPT_URL = "https://unpkg.com/html5-qrcode@2.3.8";

export const loadScannerScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCANNER_SCRIPT_URL;
    script.crossOrigin = "anonymous";
    script.async = true;
    
    script.onload = () => resolve();
    script.onerror = (error) => reject(error);
    
    document.body.appendChild(script);
  });
};

export const getScannerConfig = () => ({
  fps: 10,
  qrbox: { width: 250, height: 250 },
  aspectRatio: 1.0,
  formatsToSupport: [ "EAN_13", "EAN_8", "CODE_128" ],
  experimentalFeatures: {
    useBarCodeDetectorIfSupported: true
  }
});

export const cleanupScanner = (scanner: any) => {
  if (scanner) {
    scanner.stop().catch((err: any) => console.error("Error stopping scanner:", err));
  }
};