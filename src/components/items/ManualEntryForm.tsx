import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { toast } from "sonner";

interface ManualEntryFormProps {
  newItemCode: string;
  setNewItemCode: (value: string) => void;
  onAdd: () => void;
}

const ManualEntryForm = ({ newItemCode, setNewItemCode, onAdd }: ManualEntryFormProps) => {
  const handleManualAdd = () => {
    if (!newItemCode.trim()) {
      toast.error("Please enter an item code");
      return;
    }
    onAdd();
  };

  return (
    <div className="mb-6 space-y-2">
      <Input
        type="text"
        placeholder="Enter item code manually"
        value={newItemCode}
        onChange={(e) => setNewItemCode(e.target.value)}
      />
      <Button onClick={handleManualAdd} className="w-full">
        Add Manual Entry
      </Button>
    </div>
  );
};

export default ManualEntryForm;