import { lazy, Suspense } from "react";
const DriverPrivacy = lazy(() => import("./pages/DriverPrivacy"));
const ClientPrivacy = lazy(() => import("./pages/ClientPrivacy"));
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
const Index = lazy(() => import("./pages/Index"));
const Military = lazy(() => import("./pages/Military"));
const Quick = lazy(() => import("./pages/Quick"));
const Home = lazy(() => import("./pages/Home"));
const QuickVk = lazy(() => import("./pages/QuickVk"));
const Direct = lazy(() => import("./pages/Direct"));
const Keywords = lazy(() => import("./pages/Keywords"));
const Promo = lazy(() => import("./pages/Promo"));
const Tariffs = lazy(() => import("./pages/Tariffs"));
const Reviews = lazy(() => import("./pages/Reviews"));
const PageNotFound = lazy(() => import("./pages/PageNotFound"));
const KPP = lazy(() => import("./pages/KPP"));
const KppOnline = lazy(() => import("./pages/KppOnline"));
const Moscow = lazy(() => import("./pages/regions/Moscow"));
const Belgorod = lazy(() => import("./pages/regions/Belgorod"));
const Boguchar = lazy(() => import("./pages/regions/Boguchar"));
const Voronezh = lazy(() => import("./pages/regions/Voronezh"));
const Kursk = lazy(() => import("./pages/regions/Kursk"));
const Ryazan = lazy(() => import("./pages/regions/Ryazan"));
const SPb = lazy(() => import("./pages/regions/SPb"));
const Nizhny = lazy(() => import("./pages/regions/Nizhny"));
const Izhevsk = lazy(() => import("./pages/regions/Izhevsk"));
const Krasnodar = lazy(() => import("./pages/regions/Krasnodar"));
const Rostov = lazy(() => import("./pages/regions/Rostov"));
const Samara = lazy(() => import("./pages/regions/Samara"));
const Stavropol = lazy(() => import("./pages/regions/Stavropol"));
const Novosibirsk = lazy(() => import("./pages/regions/Novosibirsk"));
const Tyumen = lazy(() => import("./pages/regions/Tyumen"));
const Chelyabinsk = lazy(() => import("./pages/regions/Chelyabinsk"));
const Ekaterinburg = lazy(() => import("./pages/regions/Ekaterinburg"));
const Donetsk = lazy(() => import("./pages/regions/Donetsk"));
const Lugansk = lazy(() => import("./pages/regions/Lugansk"));
const Kherson = lazy(() => import("./pages/regions/Kherson"));
const Rovenki = lazy(() => import("./pages/regions/Rovenki"));
const TownPage = lazy(() => import("./pages/TownPage"));
const Lite = lazy(() => import("./pages/Lite"));
const Max = lazy(() => import("./pages/Max"));
const Call = lazy(() => import("./pages/Call"));
const RouteLandingPage = lazy(() => import("./pages/RouteLandingPage"));
const Pages = lazy(() => import("./pages/Pages"));
const Deals = lazy(() => import("./pages/Deals"));
const Clicks = lazy(() => import("./pages/Clicks"));
const Russia = lazy(() => import("./pages/Russia"));
const PosterHome = lazy(() => import("./pages/PosterHome"));
const MainHome = lazy(() => import("./pages/MainHome"));
const NewHome = lazy(() => import("./pages/NewHome"));
import { ROUTE_LANDINGS } from "./lib/routeLandings";
const MoscowBusiness = lazy(() => import("./pages/MoscowBusiness"));
const Otzyv = lazy(() => import("./pages/Otzyv"));
const AppClient = lazy(() => import("./pages/app/AppClient"));
const AppTrack = lazy(() => import("./pages/app/AppTrack"));
const AppDriver = lazy(() => import("./pages/app/AppDriver"));
const AppDispatcher = lazy(() => import("./pages/app/AppDispatcher"));
const DispatcherCalc = lazy(() => import("./pages/app/DispatcherCalc"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0b0b0f" }} />}>
        <Routes>
          <Route path="/" element={<AppClient />} />
          <Route path="/old-main" element={<MainHome />} />
          <Route path="/poster" element={<PosterHome />} />
          <Route path="/new" element={<NewHome />} />
          <Route path="/full" element={<Home />} />
          <Route path="/info" element={<Index />} />
          <Route path="/voennye" element={<Military />} />
          <Route path="/kpp" element={<KPP />} />
          <Route path="/kpp-online" element={<KppOnline />} />
          <Route path="/zvoni" element={<Quick />} />
          <Route path="/vk" element={<QuickVk />} />
          <Route path="/direct" element={<Direct />} />
          <Route path="/keywords" element={<Keywords />} />
          <Route path="/promo" element={<Promo />} />
          <Route path="/tariffs" element={<Tariffs />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/otzyv" element={<Otzyv />} />
          <Route path="/rossiya" element={<Russia />} />

          {/* Региональные посадочные страницы */}
          <Route path="/moscow-business" element={<MoscowBusiness />} />
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
          <Route path="/samara" element={<Samara />} />
          <Route path="/stavropol" element={<Stavropol />} />
          <Route path="/novosibirsk" element={<Novosibirsk />} />
          <Route path="/tyumen" element={<Tyumen />} />
          <Route path="/chelyabinsk" element={<Chelyabinsk />} />
          <Route path="/ekaterinburg" element={<Ekaterinburg />} />
          <Route path="/donetsk" element={<Donetsk />} />
          <Route path="/lugansk" element={<Lugansk />} />
          <Route path="/kherson" element={<Kherson />} />
          <Route path="/rovenki" element={<Rovenki />} />
          <Route path="/lite" element={<Lite />} />
          <Route path="/max" element={<Max />} />
          <Route path="/call" element={<Call />} />
          <Route path="/pages" element={<Pages />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/clicks" element={<Clicks />} />
          {ROUTE_LANDINGS.map((r) => (
            <Route key={r.slug} path={`/${r.slug}`} element={<RouteLandingPage />} />
          ))}

          <Route path="/app" element={<Navigate to="/app/client" replace />} />
          <Route path="/app/client" element={<AppClient />} />
          <Route path="/track/:token" element={<AppTrack />} />
          <Route path="/app/driver" element={<AppDriver />} />
          <Route path="/privacy-drivers" element={<DriverPrivacy />} />
          <Route path="/privacy" element={<ClientPrivacy />} />
          <Route path="/app/office-k7x2" element={<AppDispatcher />} />
          <Route path="/app/calc-k7x2" element={<DispatcherCalc />} />

          <Route path="/:slug" element={<TownPage />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;