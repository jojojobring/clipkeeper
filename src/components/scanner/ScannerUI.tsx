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
    <div className="fixed inset-0 flex flex-col bg-black">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 z-50 text-white"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>
      
      {isInitializing && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          Initializing camera...
        </div>
      )}
      
      <div className="relative flex-1">
        <div id="interactive" className="viewport absolute inset-0" />
      </div>

      <div className="h-20 bg-black flex items-center justify-center">
        <Button
          onClick={onCapture}
          className="rounded-full w-16 h-16 p-0 bg-white text-black hover:bg-white/90"
          disabled={!lastScannedCode}
        >
          <Camera className="h-8 w-8" />
        </Button>
      </div>

      <style>
        {`
          .viewport {
            position: relative;
            width: 100%;
            height: 100%;
          }
          .viewport > video {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .drawingBuffer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
          }
          #interactive.viewport > canvas.drawingBuffer {
            width: 100%;
            height: 100%;
          }
        `}
      </style>
    </div>
  );
};

export default ScannerUI;