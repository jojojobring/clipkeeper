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
    if (isProcessingRef.current) {
      console.log("Skipping scan - already processing");
      return;
    }

    try {
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
    } finally {
      // Add a small delay before allowing the next scan
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 1000);
    }
  };

  const handleClose = () => {
    isProcessingRef.current = false; // Make sure to reset the processing state
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