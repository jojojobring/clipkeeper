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
    <div className="fixed inset-0 bg-black flex flex-col h-[100dvh]">
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
      
      <div id="reader" className="flex-1 relative" />

      <style>
        {`
          #reader {
            height: calc(100dvh - 5rem) !important;
            width: 100% !important;
          }
          #reader video {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
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
            width: 24px;
            height: 24px;
            border-color: white;
            border-style: solid;
            border-width: 3px;
            z-index: 20;
          }
          #reader__scan_region::before {
            top: 20px;
            left: 20px;
            border-right: 0;
            border-bottom: 0;
          }
          #reader__scan_region::after {
            top: 20px;
            right: 20px;
            border-left: 0;
            border-bottom: 0;
          }
          #reader__scan_region > div::before {
            bottom: 20px;
            left: 20px;
            border-right: 0;
            border-top: 0;
          }
          #reader__scan_region > div::after {
            bottom: 20px;
            right: 20px;
            border-left: 0;
            border-top: 0;
          }
          #reader__dashboard_section_swaplink {
            display: none !important;
          }
          #reader__dashboard_section_csr {
            display: none !important;
          }
        `}
      </style>

      <div className="fixed bottom-0 left-0 right-0 h-20 bg-black/80 backdrop-blur-sm flex items-center justify-center pb-safe">
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