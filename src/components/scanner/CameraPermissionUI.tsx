import { Button } from "../ui/button";
import { Camera } from "lucide-react";

interface CameraPermissionUIProps {
  onRetryCamera: () => void;
  onContinueWithoutCamera: () => void;
}

const CameraPermissionUI = ({ onRetryCamera, onContinueWithoutCamera }: CameraPermissionUIProps) => {
  return (
    <div className="min-h-screen bg-white p-4 flex flex-col items-center justify-center">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Camera Access Required</h2>
        <p className="text-gray-600">
          Please enable camera access to scan barcodes. You can proceed without camera access and enter codes manually.
        </p>
      </div>
      <div className="space-y-4 w-full max-w-md">
        <Button onClick={onRetryCamera} className="w-full">
          <Camera className="mr-2 h-4 w-4" />
          Try Camera Again
        </Button>
        <Button onClick={onContinueWithoutCamera} variant="outline" className="w-full">
          Continue Without Camera
        </Button>
      </div>
    </div>
  );
};

export default CameraPermissionUI;