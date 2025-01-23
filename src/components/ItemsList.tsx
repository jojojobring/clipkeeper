import { useState, useEffect } from "react";
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
  const [serviceWriter, setServiceWriter] = useState<string | null>(null);
  const [vehicleInfo, setVehicleInfo] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalesInfo = async () => {
      try {
        console.log('Fetching sales info for RO:', roNumber);
        
        const { data, error } = await supabase
          .from('sales')
          .select('service_writer_display_name, vehicle_year_make_model')
          .eq('repair_order_number', roNumber.toString())
          .maybeSingle();

        if (error) {
          console.error('Database error:', error);
          throw error;
        }
        
        console.log('Query result:', data);
        
        if (data) {
          console.log('Found sales info:', data);
          setServiceWriter(data.service_writer_display_name);
          setVehicleInfo(data.vehicle_year_make_model);
        } else {
          console.log('No matching RO number found');
          toast.warning('No sales information found for this RO number');
        }
      } catch (error) {
        console.error('Error fetching sales information:', error);
        toast.error('Failed to fetch sales information');
      }
    };

    if (roNumber) {
      fetchSalesInfo();
    }
  }, [roNumber]);

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
        serviceWriter,
        vehicleInfo,
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
        {serviceWriter && (
          <p className="text-sm text-gray-600">Service Advisor: {serviceWriter}</p>
        )}
        {vehicleInfo && (
          <p className="text-sm text-gray-600">Vehicle: {vehicleInfo}</p>
        )}
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