import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import ManualEntryForm from "./items/ManualEntryForm";
import ItemsTable from "./items/ItemsTable";
import ActionButtons from "./items/ActionButtons";
import OrderHeader from "./items/OrderHeader";
import { useSalesInfo } from "./items/useSalesInfo";

interface Item {
  code: string;
  qty: string;
  description?: string;
  price?: number;
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
  
  const { serviceWriter, vehicleInfo, repairFacilityName } = useSalesInfo(roNumber);

  const handleDeleteItem = (index: number) => {
    const newItems = [...localItems];
    newItems.splice(index, 1);
    setLocalItems(newItems);
    toast.success("Item removed");
  };

  const handleQuantityChange = (index: number, value: string) => {
    const newItems = [...localItems];
    newItems[index].qty = value;
    setLocalItems(newItems);
  };

  const handleItemDetailsLoaded = (index: number, details: { description?: string; price?: number }) => {
    const newItems = [...localItems];
    newItems[index] = {
      ...newItems[index],
      description: details.description,
      price: details.price
    };
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
      // First, insert the order into the database
      const orderData = {
        ro_number: roNumber,
        customer_name: name,
        service_writer: serviceWriter,
        vehicle_info: vehicleInfo,
        repair_facility_name: repairFacilityName,
        items: localItems.map(item => ({
          code: item.code,
          qty: item.qty,
          description: item.description,
          price: item.price
        })),
        timestamp: new Date().toISOString(),
      };

      const { data: orderResult, error: orderError } = await supabase
        .from('order_requests')
        .insert(orderData)
        .select('invoice')
        .single();

      if (orderError) throw orderError;

      // Then send to Power Automate with the invoice number
      const powerAutomatePayload = {
        ...orderData,
        invoice: orderResult.invoice
      };

      const { error: functionError } = await supabase.functions.invoke('send-to-power-automate', {
        body: powerAutomatePayload
      });

      if (functionError) throw functionError;

      toast.success("Invoice successfully created and sent to the Service Advisor");
      navigate("/success");
    } catch (error) {
      console.error("Error processing order:", error);
      toast.error("Failed to process the order. Please try again.");
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

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen p-4">
      <OrderHeader
        roNumber={roNumber}
        name={name}
        serviceWriter={serviceWriter}
        vehicleInfo={vehicleInfo}
      />

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
        onItemDetailsLoaded={handleItemDetailsLoaded}
        onDeleteItem={handleDeleteItem}
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

      <button
        onClick={handleCancel}
        className="mt-4 w-full flex items-center justify-center text-red-500 hover:text-red-700 transition-colors"
      >
        <X className="w-4 h-4 mr-2" />
        Cancel
      </button>
    </div>
  );
};

export default ItemsList;