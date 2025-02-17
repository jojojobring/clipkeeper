
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSyncData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-sales-data');
      
      if (error) {
        console.error('Function error:', error);
        toast.error('Failed to sync sales data');
        return;
      }

      console.log('Function response:', data);
      toast.success('Sales data synced successfully');
    } catch (error) {
      console.error('Error invoking function:', error);
      toast.error('Failed to sync sales data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold mb-4">Sales Data Sync</h1>
        <p className="text-xl text-gray-600 mb-8">
          Click the button below to manually sync sales data from SharePoint
        </p>
        <Button 
          onClick={handleSyncData} 
          disabled={isLoading}
          className="w-48"
        >
          {isLoading ? 'Syncing...' : 'Sync Sales Data'}
        </Button>
      </div>
    </div>
  );
};

export default Index;
