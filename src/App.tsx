import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Military from "./pages/Military";
import Quick from "./pages/Quick";
import Calc from "./pages/Calc";
import Tariffs from "./pages/Tariffs";
import Reviews from "./pages/Reviews";
import NotFound from "./pages/NotFound";
import KPP from "./pages/KPP";
import Moscow from "./pages/regions/Moscow";
import Belgorod from "./pages/regions/Belgorod";
import Boguchar from "./pages/regions/Boguchar";
import Voronezh from "./pages/regions/Voronezh";
import Kursk from "./pages/regions/Kursk";
import Ryazan from "./pages/regions/Ryazan";
import SPb from "./pages/regions/SPb";
import Nizhny from "./pages/regions/Nizhny";
import Izhevsk from "./pages/regions/Izhevsk";
import Krasnodar from "./pages/regions/Krasnodar";
import Rostov from "./pages/regions/Rostov";
import Stavropol from "./pages/regions/Stavropol";
import Novosibirsk from "./pages/regions/Novosibirsk";
import Tyumen from "./pages/regions/Tyumen";
import Chelyabinsk from "./pages/regions/Chelyabinsk";
import Ekaterinburg from "./pages/regions/Ekaterinburg";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Quick />} />
          <Route path="/info" element={<Index />} />
          <Route path="/voennye" element={<Military />} />
          <Route path="/kpp" element={<KPP />} />
          <Route path="/zvoni" element={<Quick />} />
          <Route path="/calc" element={<Calc />} />
          <Route path="/tariffs" element={<Tariffs />} />
          <Route path="/reviews" element={<Reviews />} />

          {/* Региональные посадочные страницы */}
          <Route path="/moskva" element={<Moscow />} />
          <Route path="/belgorod" element={<Belgorod />} />
          <Route path="/boguchar" element={<Boguchar />} />
          <Route path="/voronezh" element={<Voronezh />} />
          <Route path="/kursk" element={<Kursk />} />
          <Route path="/ryazan" element={<Ryazan />} />
          <Route path="/spb" element={<SPb />} />
          <Route path="/nizhniy" element={<Nizhny />} />
          <Route path="/izhevsk" element={<Izhevsk />} />
          <Route path="/krasnodar" element={<Krasnodar />} />
          <Route path="/rostov" element={<Rostov />} />
          <Route path="/stavropol" element={<Stavropol />} />
          <Route path="/novosibirsk" element={<Novosibirsk />} />
          <Route path="/tyumen" element={<Tyumen />} />
          <Route path="/chelyabinsk" element={<Chelyabinsk />} />
          <Route path="/ekaterinburg" element={<Ekaterinburg />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;