interface OrderHeaderProps {
  roNumber: string;
  name: string;
  serviceWriter: string | null;
  vehicleInfo: string | null;
}

const OrderHeader = ({ roNumber, name, serviceWriter, vehicleInfo }: OrderHeaderProps) => {
  return (
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
  );
};

export default OrderHeader;