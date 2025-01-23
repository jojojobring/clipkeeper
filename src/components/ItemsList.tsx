import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Camera } from "lucide-react";
import { toast } from "sonner";

interface Item {
  code: string;
  qty: string;
}

const ItemsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roNumber, name, items = [], cameraPermissionDenied = false } = location.state || {};
  const [localItems, setLocalItems] = useState<Item[]>(items);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [newItemCode, setNewItemCode] = useState("");

  const handleQuantityChange = (index: number, value: string) => {
    const newItems = [...localItems];
    newItems[index].qty = value;
    setLocalItems(newItems);
  };

  const handleAddItem = () => {
    navigate("/scan", {
      state: { roNumber, name, items: localItems },
    });
  };

  const handleManualAdd = () => {
    if (!newItemCode.trim()) {
      toast.error("Please enter an item code");
      return;
    }
    
    setLocalItems([...localItems, { code: newItemCode, qty: "" }]);
    setNewItemCode("");
  };

  const handleDone = () => {
    // Validate all quantities
    const isValid = localItems.every((item) => {
      const qty = parseInt(item.qty);
      return !isNaN(qty) && qty > 0;
    });

    if (!isValid) {
      toast.error("All quantities must be positive numbers");
      return;
    }

    setIsReadOnly(true);
  };

  const handleConfirm = () => {
    toast.success("Invoice successfully created");
    navigate("/success");
  };

  return (
    <div className="min-h-screen p-4">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">RO Number: {roNumber}</h2>
        <p className="text-sm text-gray-600">Name: {name}</p>
      </div>

      {cameraPermissionDenied && !isReadOnly && (
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
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Item</th>
              <th className="text-left py-2">Qty</th>
            </tr>
          </thead>
          <tbody>
            {localItems.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="py-2">{item.code}</td>
                <td className="py-2">
                  {isReadOnly ? (
                    <span>{item.qty}</span>
                  ) : (
                    <Input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                      className="w-20"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isReadOnly && (
        <div className="mt-6 space-y-4">
          <Button onClick={handleAddItem} className="w-full">
            {cameraPermissionDenied ? (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Try Camera Scan
              </>
            ) : (
              "Add item"
            )}
          </Button>
          <Button onClick={handleDone} className="w-full">
            Done
          </Button>
        </div>
      )}

      {isReadOnly && (
        <Button onClick={handleConfirm} className="w-full mt-6">
          Confirm
        </Button>
      )}
    </div>
  );
};

export default ItemsList;