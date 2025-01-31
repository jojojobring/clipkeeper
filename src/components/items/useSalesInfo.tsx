import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useSalesInfo = (roNumber: string) => {
  const [serviceWriter, setServiceWriter] = useState<string | null>(null);
  const [vehicleInfo, setVehicleInfo] = useState<string | null>(null);
  const [repairFacilityName, setRepairFacilityName] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalesInfo = async () => {
      try {
        console.log('Fetching sales info for RO:', roNumber);
        
        const { data, error } = await supabase
          .from('sales')
          .select('service_writer_display_name, vehicle_year_make_model, repair_facility_name')
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
          setRepairFacilityName(data.repair_facility_name);
        } else {
          console.log('No matching RO number found');
          toast.error('No sales information found for this RO number');
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

  return { serviceWriter, vehicleInfo, repairFacilityName };
};