import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import InitialForm from "./components/InitialForm";
import BarcodeScanner from "./components/BarcodeScanner";
import ItemsList from "./components/ItemsList";
import Success from "./components/Success";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<InitialForm />} />
          <Route path="/scan" element={<BarcodeScanner />} />
          <Route path="/items" element={<ItemsList />} />
          <Route path="/success" element={<Success />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;