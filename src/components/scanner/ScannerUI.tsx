import { Button } from "../ui/button";
import { Camera, X } from "lucide-react";

interface ScannerUIProps {
  onClose: () => void;
  onCapture: () => void;
  isInitializing: boolean;
  lastScannedCode: string | null;
}

const ScannerUI = ({ onClose, onCapture, isInitializing, lastScannedCode }: ScannerUIProps) => {
  return (
    <div className="min-h-screen bg-black relative flex flex-col">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white z-10"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>
      
      {isInitializing && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          Initializing camera...
        </div>
      )}
      
      <div id="reader" className="w-full h-[calc(100vh-80px)]" />

      <div className="fixed bottom-0 left-0 right-0 h-20 bg-black flex items-center justify-center">
        <Button
          onClick={onCapture}
          className="rounded-full w-16 h-16 p-0"
          disabled={!lastScannedCode}
        >
          <Camera className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
};

export default ScannerUI;