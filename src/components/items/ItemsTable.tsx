import { Input } from "../ui/input";

interface Item {
  code: string;
  qty: string;
}

interface ItemsTableProps {
  items: Item[];
  isReadOnly: boolean;
  onQuantityChange: (index: number, value: string) => void;
}

const ItemsTable = ({ items, isReadOnly, onQuantityChange }: ItemsTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Item</th>
            <th className="text-left py-2">Qty</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
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