import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { CheckCircle } from "lucide-react";

const Success = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center">
      <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
      <h1 className="text-2xl font-semibold mb-6">Invoice successfully created</h1>
      <Button onClick={() => navigate("/")} className="w-full max-w-sm">
        Create new
      </Button>
    </div>
  );
};

export default Success;