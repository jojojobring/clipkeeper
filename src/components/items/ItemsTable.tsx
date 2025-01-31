import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

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
  onDeleteItem?: (index: number) => void;
}

const ItemsTable = ({ 
  items, 
  isReadOnly, 
  onQuantityChange, 
  onItemDetailsLoaded,
  onDeleteItem 
}: ItemsTableProps) => {
  useEffect(() => {
    const fetchItemDetails = async (code: string, index: number) => {
      try {
        console.log('Fetching details for item code:', code);
        
        const trimmedCode = code.trim();
        console.log('Trimmed code:', trimmedCode);
        
        const { data, error } = await supabase
          .from('items')
          .select('description, price')
          .eq('item_code', trimmedCode)
          .order('price', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Database error:', error);
          throw error;
        }
        
        console.log('Query result:', data);
        
        if (data) {
          console.log('Found item:', data);
          onItemDetailsLoaded(index, {
            description: data.description,
            price: data.price
          });
        } else {
          console.log('No item found for code:', trimmedCode);
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
        <TableHeader isReadOnly={isReadOnly} />
        <tbody>
          {items.map((item, index) => (
            <TableRow
              key={index}
              item={item}
              index={index}
              isReadOnly={isReadOnly}
              onQuantityChange={onQuantityChange}
              onDeleteItem={onDeleteItem}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ItemsTable;