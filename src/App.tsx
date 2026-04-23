import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "@/contexts/SessionContext";
import Index from "./pages/Index.tsx";
import RecallTest from "./pages/RecallTest.tsx";
import LockInTest from "./pages/LockInTest.tsx";
import SharpnessTest from "./pages/SharpnessTest.tsx";
import ContentAdmin from "./pages/ContentAdmin.tsx";
import MiniGame from "./pages/MiniGame.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/recall" element={<RecallTest />} />
            <Route path="/lock-in" element={<LockInTest />} />
            <Route path="/sharpness" element={<SharpnessTest />} />
            <Route path="/admin/content" element={<ContentAdmin />} />
            <Route path="/mini-game" element={<MiniGame />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
