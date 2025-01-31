interface TableHeaderProps {
  isReadOnly: boolean;
}

const TableHeader = ({ isReadOnly }: TableHeaderProps) => {
  return (
    <thead>
      <tr className="border-b">
        <th className="text-left py-2 px-4">Item</th>
        <th className="text-left py-2 px-4">Description</th>
        <th className="text-left py-2 px-4">Qty</th>
        {!isReadOnly && <th className="w-10"></th>}
      </tr>
    </thead>
  );
};

export default TableHeader;