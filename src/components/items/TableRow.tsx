import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";

interface Item {
  code: string;
  qty: string;
  description?: string;
  price?: number;
}

interface TableRowProps {
  item: Item;
  index: number;
  isReadOnly: boolean;
  onQuantityChange: (index: number, value: string) => void;
  onDeleteItem?: (index: number) => void;
}

const TableRow = ({ 
  item, 
  index, 
  isReadOnly, 
  onQuantityChange, 
  onDeleteItem 
}: TableRowProps) => {
  return (
    <tr className="border-b">
      <td className="py-2 px-4">{item.code}</td>
      <td className="py-2 px-4 text-left">{item.description || 'Loading...'}</td>
      <td className="py-2 px-4">
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
      {!isReadOnly && (
        <td className="py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteItem?.(index)}
            className="h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </td>
      )}
    </tr>
  );
};

export default TableRow;