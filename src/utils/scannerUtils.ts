import { Html5Qrcode } from "html5-qrcode";

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