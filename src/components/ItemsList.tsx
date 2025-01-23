import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ManualEntryForm from "./items/ManualEntryForm";
import ItemsTable from "./items/ItemsTable";
import ActionButtons from "./items/ActionButtons";

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
  const [isSending, setIsSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleQuantityChange = (index: number, value: string) => {
    const newItems = [...localItems];
    newItems[index].qty = value;
    setLocalItems(newItems);
  };

  const handleAddItem = () => {
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
    setLocalItems([...localItems, { code: newItemCode, qty: "" }]);
    setNewItemCode("");
  };

  const handleDone = () => {
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

      const { data, error } = await supabase.functions.invoke('send-to-power-automate', {
        body: payload
      });

      if (error) throw error;

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
        <ManualEntryForm
          newItemCode={newItemCode}
          setNewItemCode={setNewItemCode}
          onAdd={handleManualAdd}
        />
      )}

      <ItemsTable
        items={localItems}
        isReadOnly={isReadOnly}
        onQuantityChange={handleQuantityChange}
      />

      <ActionButtons
        isReadOnly={isReadOnly}
        showConfirm={showConfirm}
        isSending={isSending}
        cameraPermissionDenied={cameraPermissionDenied}
        onAddItem={handleAddItem}
        onDone={handleDone}
        onConfirm={handleConfirm}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default ItemsList;