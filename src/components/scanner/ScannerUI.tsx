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
    <div className="min-h-[100dvh] bg-black relative flex flex-col">
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
      
      <div id="reader" className="flex-1 min-h-0" />

      <style>
        {`
          #reader video {
            max-height: calc(100dvh - 5rem) !important;
            object-fit: cover !important;
          }
          #reader__scan_region {
            background: transparent !important;
          }
          #reader__scan_region::before,
          #reader__scan_region::after,
          #reader__scan_region > div::before,
          #reader__scan_region > div::after {
            content: '';
            position: absolute;
            width: 20px;
            height: 20px;
            border-color: white;
            border-style: solid;
          }
          #reader__scan_region::before {
            top: 0;
            left: 0;
            border-width: 3px 0 0 3px;
          }
          #reader__scan_region::after {
            top: 0;
            right: 0;
            border-width: 3px 3px 0 0;
          }
          #reader__scan_region > div::before {
            bottom: 0;
            left: 0;
            border-width: 0 0 3px 3px;
          }
          #reader__scan_region > div::after {
            bottom: 0;
            right: 0;
            border-width: 0 3px 3px 0;
          }
        `}
      </style>

      <div className="sticky bottom-0 left-0 right-0 h-20 bg-black flex items-center justify-center">
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