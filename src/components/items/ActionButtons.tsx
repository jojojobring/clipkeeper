import { Button } from "../ui/button";
import { Camera } from "lucide-react";

interface ActionButtonsProps {
  isReadOnly: boolean;
  showConfirm: boolean;
  isSending: boolean;
  cameraPermissionDenied: boolean;
  onAddItem: () => void;
  onDone: () => void;
  onConfirm: () => void;
  onEdit: () => void;
}

const ActionButtons = ({
  isReadOnly,
  showConfirm,
  isSending,
  cameraPermissionDenied,
  onAddItem,
  onDone,
  onConfirm,
  onEdit,
}: ActionButtonsProps) => {
  return (
    <div className="mt-6 space-y-4">
      {!isReadOnly && (
        <>
          <Button onClick={onAddItem} className="w-full">
            {cameraPermissionDenied ? (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Try Camera Scan
              </>
            ) : (
              "Add item"
            )}
          </Button>
          <Button onClick={onDone} className="w-full">
            Done
          </Button>
        </>
      )}

      {showConfirm && (
        <div className="space-y-4">
          <Button 
            onClick={onConfirm} 
            className="w-full"
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Confirm"}
          </Button>
          <Button 
            onClick={onEdit} 
            variant="outline"
            className="w-full"
          >
            Edit
          </Button>
        </div>
      )}
    </div>
  );
};

export default ActionButtons;