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

// Predefined webhook URL
const WEBHOOK_URL = "https://prod-53.westus.logic.azure.com:443/workflows/b926b63c09fa4d01960d8f55a88da788/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=6ZxIoQjtXzMmTyfIf0xmXysTA5HjP6GqLc8xvuWTJIM";

const ItemsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roNumber, name, items = [], cameraPermissionDenied = false } = location.state || {};
  const [localItems, setLocalItems] = useState<Item[]>(items);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [newItemCode, setNewItemCode] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleQuantityChange = (index: number, value: string) => {
    const newItems = [...localItems];
    newItems[index].qty = value;
    setLocalItems(newItems);
  };

  const handleAddItem = () => {
    cleanupAndNavigate();
  };

  const cleanupAndNavigate = () => {
    navigate("/scan", {
      state: {
        roNumber,
        name,
        items: localItems,
        cameraPermissionDenied: false
      },
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
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setIsSending(true);

    try {
      const payload = {
        roNumber,
        name,
        items: localItems,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors", // Handle CORS restrictions
        body: JSON.stringify(payload),
      });

      toast.success("Invoice successfully created and sent to the Service Advisor");
      navigate("/success");
    } catch (error) {
      console.error("Error sending data:", error);
      toast.error("Failed to send data to Power Automate. Please try again.");
      setIsReadOnly(false);
      setShowConfirm(false);
    } finally {
      setIsSending(false);
    }
  };

  const handleEdit = () => {
    setIsReadOnly(false);
    setShowConfirm(false);
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

      <div className="mt-6 space-y-4">
        {!isReadOnly && (
          <>
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
          </>
        )}

        {showConfirm && (
          <div className="space-y-4">
            <Button 
              onClick={handleConfirm} 
              className="w-full"
              disabled={isSending}
            >
              {isSending ? "Sending..." : "Confirm"}
            </Button>
            <Button 
              onClick={handleEdit} 
              variant="outline"
              className="w-full"
            >
              Edit
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemsList;