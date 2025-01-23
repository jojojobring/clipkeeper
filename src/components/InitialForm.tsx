import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";

const InitialForm = () => {
  const navigate = useNavigate();
  const [roNumber, setRoNumber] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!/^\d{4}$/.test(roNumber)) {
      toast.error("RO Number must be exactly 4 digits");
      return;
    }
    
    if (name.length > 128) {
      toast.error("Name must be 128 characters or less");
      return;
    }
    
    if (name.trim() === "") {
      toast.error("Name is required");
      return;
    }

    navigate("/items", { state: { roNumber, name, items: [] } });
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <Label htmlFor="roNumber">RO Number</Label>
          <Input
            id="roNumber"
            type="text"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            value={roNumber}
            onChange={(e) => setRoNumber(e.target.value)}
            placeholder="Enter 4 digit number"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            maxLength={128}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
            required
          />
        </div>

        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </div>
  );
};

export default InitialForm;