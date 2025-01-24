import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";

const InitialForm = () => {
  const [roNumber, setRoNumber] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roNumber.trim() || !name.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (roNumber.length > 4) {
      toast.error("RO Number must be 4 characters or less");
      return;
    }

    navigate("/scan", {
      state: {
        roNumber,
        name,
        items: [],
      },
    });
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-md mx-auto">
        <div className="mb-8 flex justify-center">
          <img 
            src={`${import.meta.env.BASE_URL}lovable-uploads/22053a54-80a5-4c23-9610-ba9efd9af495.png`}
            alt="Care Collision Logo" 
            className="h-16 md:h-20"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="RO Number"
              value={roNumber}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 4) {
                  setRoNumber(value);
                }
              }}
              maxLength={4}
              className="w-full"
            />
          </div>
          <div>
            <Input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>
          <Button type="submit" className="w-full">
            Start Scanning
          </Button>
        </form>
      </div>
    </div>
  );
};

export default InitialForm;