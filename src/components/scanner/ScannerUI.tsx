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
    <div className="fixed inset-0 flex flex-col bg-black h-[100dvh] w-full">
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
      
      <div id="reader" className="w-full h-full" />

      <style>
        {`
          #reader {
            width: 100% !important;
            height: 100% !important;
            position: relative !important;
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
            position: absolute !important;
            inset: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          #reader__scan_region::before {
            content: '';
            position: absolute;
            width: 200px;
            height: 200px;
            border: 2px solid rgba(255, 255, 255, 0.5);
          }
          #reader__scan_region > div {
            position: relative;
            width: 200px;
            height: 200px;
          }
          #reader__scan_region > div::before,
          #reader__scan_region > div::after,
          #reader__scan_region > div > div:first-child::before,
          #reader__scan_region > div > div:first-child::after {
            content: '';
            position: absolute;
            width: 20px;
            height: 20px;
            border-color: #22c55e;
            border-style: solid;
          }
          /* Top left corner */
          #reader__scan_region > div::before {
            top: 0;
            left: 0;
            border-width: 2px 0 0 2px;
          }
          /* Top right corner */
          #reader__scan_region > div::after {
            top: 0;
            right: 0;
            border-width: 2px 2px 0 0;
          }
          /* Bottom left corner */
          #reader__scan_region > div > div:first-child::before {
            bottom: 0;
            left: 0;
            border-width: 0 0 2px 2px;
          }
          /* Bottom right corner */
          #reader__scan_region > div > div:first-child::after {
            bottom: 0;
            right: 0;
            border-width: 0 2px 2px 0;
          }
          #reader__dashboard_section_swaplink {
            display: none !important;
          }
          #reader__dashboard_section_csr {
            display: none !important;
          }
          #reader__dashboard_section_csr button {
            display: none !important;
          }
          #reader__camera_selection {
            display: none !important;
          }
          #reader__status_span {
            display: none !important;
          }
        `}
      </style>

      <div className="fixed bottom-0 left-0 right-0 h-[80px] bg-black flex items-center justify-center z-50">
        <Button
          onClick={onCapture}
          className="rounded-full w-16 h-16 p-0 bg-white text-black hover:bg-white/90"
          disabled={!lastScannedCode}
        >
          <Camera className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
};

export default ScannerUI;