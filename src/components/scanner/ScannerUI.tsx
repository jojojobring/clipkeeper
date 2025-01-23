import { Button } from "../ui/button";
import { X } from "lucide-react";

interface ScannerUIProps {
  onClose: () => void;
  isInitializing: boolean;
}

const ScannerUI = ({ onClose, isInitializing }: ScannerUIProps) => {
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
        <div id="reader" className="absolute inset-0" />
      </div>

      <style>
        {`
          #reader {
            width: 100% !important;
            height: 100% !important;
          }
          #reader video {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
          }
          #reader__scan_region {
            position: absolute !important;
            inset: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: transparent !important;
          }
          #reader__scan_region > div {
            position: relative !important;
            width: 200px !important;
            height: 200px !important;
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
          #reader__scan_region > div::before {
            top: 0;
            left: 0;
            border-width: 2px 0 0 2px;
          }
          #reader__scan_region > div::after {
            top: 0;
            right: 0;
            border-width: 2px 2px 0 0;
          }
          #reader__scan_region > div > div:first-child::before {
            bottom: 0;
            left: 0;
            border-width: 0 0 2px 2px;
          }
          #reader__scan_region > div > div:first-child::after {
            bottom: 0;
            right: 0;
            border-width: 0 2px 2px 0;
          }
          #reader__dashboard_section_swaplink,
          #reader__dashboard_section_csr,
          #reader__dashboard_section_csr button,
          #reader__camera_selection,
          #reader__status_span {
            display: none !important;
          }
        `}
      </style>
    </div>
  );
};

export default ScannerUI;