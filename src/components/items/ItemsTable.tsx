import { useEffect } from "react";
import { Input } from "../ui/input";
import { supabase } from "@/integrations/supabase/client";

interface Item {
  code: string;
  qty: string;
  description?: string;
  price?: number;
}

interface ItemsTableProps {
  items: Item[];
  isReadOnly: boolean;
  onQuantityChange: (index: number, value: string) => void;
  onItemDetailsLoaded: (index: number, details: { description?: string; price?: number }) => void;
}

const ItemsTable = ({ items, isReadOnly, onQuantityChange, onItemDetailsLoaded }: ItemsTableProps) => {
  useEffect(() => {
    const fetchItemDetails = async (code: string, index: number) => {
      try {
        const { data, error } = await supabase
          .from('items')
          .select('description, price')
          .eq('item_code', code)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          onItemDetailsLoaded(index, {
            description: data.description,
            price: data.price
          });
        } else {
          onItemDetailsLoaded(index, {
            description: "Not found",
            price: 0
          });
        }
      } catch (error) {
        console.error('Error fetching item details:', error);
        onItemDetailsLoaded(index, {
          description: "Not found",
          price: 0
        });
      }
    };

    items.forEach((item, index) => {
      if (item.code && !item.description) {
        fetchItemDetails(item.code, index);
      }
    });
  }, [items, onItemDetailsLoaded]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Item</th>
            <th className="text-left py-2">Description</th>
            <th className="text-left py-2">Price</th>
            <th className="text-left py-2">Qty</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="py-2">{item.code}</td>
              <td className="py-2">{item.description || 'Loading...'}</td>
              <td className="py-2">${item.price?.toFixed(2) || '...'}</td>
              <td className="py-2">
                {isReadOnly ? (
                  <span>{item.qty}</span>
                ) : (
                  <Input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => onQuantityChange(index, e.target.value)}
                    className="w-20"
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemsTable;