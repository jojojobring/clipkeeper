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
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let scriptElement: HTMLScriptElement | null = null;

    const initCamera = async () => {
      try {
        // First check for camera permissions
        await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: "environment"
          } 
        });
        
        // Load scanner script
        scriptElement = document.createElement("script");
        scriptElement.src = "https://unpkg.com/html5-qrcode@2.3.8";
        scriptElement.crossOrigin = "anonymous";
        scriptElement.async = true;
        
        scriptElement.onload = () => {
          initializeScanner();
        };

        scriptElement.onerror = (error) => {
          console.error("Failed to load scanner script:", error);
          toast.error("Failed to load scanner. Please try again.");
          setIsInitializing(false);
        };

        document.body.appendChild(scriptElement);
      } catch (error) {
        console.error("Camera permission error:", error);
        toast.error("Please allow camera access to scan barcodes");
        setIsInitializing(false);
      }
    };

    initCamera();

    // Cleanup function
    return () => {
      if (scriptElement && document.body.contains(scriptElement)) {
        document.body.removeChild(scriptElement);
      }
      if (scanner) {
        scanner.stop().catch((err: any) => console.error("Error stopping scanner:", err));
      }
    };
  }, []);

  const initializeScanner = async () => {
    try {
      const html5QrCode = new window.Html5Qrcode("reader", { 
        verbose: false 
      });
      setScanner(html5QrCode);

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        formatsToSupport: [ "EAN_13", "EAN_8", "CODE_128" ]
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanFailure
      );
      
      setIsInitializing(false);
    } catch (error) {
      console.error("Error starting scanner:", error);
      toast.error("Failed to start camera. Please try again.");
      setIsInitializing(false);
    }
  };

  const onScanSuccess = (decodedText: string) => {
    if (scanner) {
      scanner
        .stop()
        .then(() => {
          const currentItems = location.state?.items || [];
          const newItem = { code: decodedText, qty: "" };
          
          navigate("/items", {
            state: {
              ...location.state,
              items: [...currentItems, newItem],
            },
          });
        })
        .catch((err: any) => {
          console.error("Error stopping scanner:", err);
          toast.error("Error processing scan. Please try again.");
        });
    }
  };

  const onScanFailure = (error: any) => {
    // Silent failure is fine for scanning attempts
    console.debug("Scan failure:", error);
  };

  const handleClose = () => {
    if (scanner) {
      scanner
        .stop()
        .catch((err: any) => console.error("Error stopping scanner:", err));
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
      
      {isInitializing && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          Initializing camera...
        </div>
      )}
      
      <div id="reader" className="w-full h-screen" />
    </div>
  );
};

export default BarcodeScanner;