import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MutableRefObject } from "react";

interface UseBarcodeCapture {
  isProcessingRef: MutableRefObject<boolean>;
}

export const useBarcodeCapture = ({ isProcessingRef }: UseBarcodeCapture) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCapture = async (decodedText: string) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    
    console.log("Handling capture for:", decodedText);
    const currentItems = location.state?.items || [];
    const newItem = { code: decodedText, qty: "" };
    
    toast.success("Barcode captured successfully!");
    
    navigate("/items", {
      state: {
        ...location.state,
        items: [...currentItems, newItem],
        cameraPermissionDenied: false
      },
    });
  };

  const handleClose = () => {
    navigate("/items", {
      state: {
        ...location.state,
        cameraPermissionDenied: true
      }
    });
  };

  return {
    handleCapture,
    handleClose
  };
};