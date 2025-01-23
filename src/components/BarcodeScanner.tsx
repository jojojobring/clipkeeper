import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    Html5Qrcode: any;
  }
}

const BarcodeScanner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scanner, setScanner] = useState<any>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/html5-qrcode";
    script.async = true;
    script.onload = initializeScanner;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      if (scanner) {
        scanner.stop();
      }
    };
  }, []);

  const initializeScanner = () => {
    const html5QrCode = new window.Html5Qrcode("reader");
    setScanner(html5QrCode);

    html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      onScanSuccess,
      onScanFailure
    );
  };

  const onScanSuccess = (decodedText: string) => {
    if (scanner) {
      scanner.stop();
    }
    
    const currentItems = location.state?.items || [];
    const newItem = { code: decodedText, qty: "" };
    
    navigate("/items", {
      state: {
        ...location.state,
        items: [...currentItems, newItem],
      },
    });
  };

  const onScanFailure = (error: any) => {
    // Silent failure is fine for scanning attempts
  };

  const handleClose = () => {
    if (scanner) {
      scanner.stop();
    }
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-black relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white z-10"
        onClick={handleClose}
      >
        <X className="h-6 w-6" />
      </Button>
      
      <div id="reader" className="w-full h-screen" />
    </div>
  );
};

export default BarcodeScanner;