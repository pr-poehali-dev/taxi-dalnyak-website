import { useEffect, useMemo } from "react";
import { DEFAULT_CONTACTS, MAX_TRACK_CHAT } from "@/lib/contacts";
import { cityRod } from "@/lib/routeFromQuery";
import { ymGoal, ymLead } from "@/components/regional/shared";
import { useMaxTrack } from "@/components/regional/useMaxTrack";
import type { LpLinks } from "@/components/lp/LpCta";
import LpCta from "@/components/lp/LpCta";
import LpFaq, { type FaqItem } from "@/components/lp/LpFaq";
import LpStickyBar from "@/components/lp/LpStickyBar";
import LpCalm from "@/components/lp/LpCalm";
import ReviewsSlider from "@/components/main/ReviewsSlider";
import RuHero from "@/components/russia/RuHero";
import { RuCars, RuRoutes, RuStats, RuSteps, RuWhat, RuWhy } from "@/components/russia/RuBlocks";
import { routesFrom } from "@/components/russia/routes";
import { useAdCity } from "@/components/russia/useAdCity";

const MIN_KM = 150;
const CHANNEL_GOAL: Record<string, string> = { phone: "phone_click", telegram: "tg_click", max: "max_click" };
const URL = "https://taxidalnyack.ru/rossiya";

function setMeta(sel: string, attr: string, val: string, create: () => HTMLElement) {
  let el = document.head.querySelector(sel) as HTMLElement | null;
  if (!el) { el = create(); document.head.appendChild(el); }
  el.setAttribute(attr, val);
}

export default function Russia() {
  const { PHONE, PHONE_HREF, TG_HREF } = DEFAULT_CONTACTS;
  const { from, to, utm } = useAdCity();
  useMaxTrack(true);

  useEffect(() => {
    const t = from && to
      ? `Такси ${from} — ${to}: межгород по фиксированной цене | Такси Дальняк`
      : from
        ? `Такси межгород из ${cityRod(from)} в другой город | Такси Дальняк`
        : "Такси межгород по России: из вашего города в любой город | Такси Дальняк";
    document.title = t;
    const d = "Междугороднее такси по всей России, в Крым, ДНР и ЛНР. От двери до двери, цена фиксируется до выезда, без предоплаты и попутчиков. Круглосуточно: +7 (995) 645-51-25.";
    setMeta('meta[name="description"]', "content", d, () => Object.assign(document.createElement("meta"), { name: "description" }));
    setMeta('link[rel="canonical"]', "href", URL, () => Object.assign(document.createElement("link"), { rel: "canonical" }));
  }, [from, to]);

  const links: LpLinks = useMemo(() => {
    const tg = new window.URL(TG_HREF);
    tg.searchParams.set("utm_source", utm.source);
    tg.searchParams.set("utm_medium", utm.medium);
    tg.searchParams.set("utm_campaign", utm.campaign);
    tg.searchParams.set("utm_content", "tg_button");
    return { phone: PHONE_HREF, telegram: tg.toString(), max: MAX_TRACK_CHAT };
  }, [PHONE_HREF, TG_HREF, utm]);

  const onLead = (channel: string) => {
    ymGoal(CHANNEL_GOAL[channel] ?? `${channel}_click`, {
      utm_source: utm.source, utm_medium: utm.medium, utm_campaign: utm.campaign, city: from ?? "russia",
    });
    ymLead(channel, utm, "russia");
  };

  const callNow = () => {
    onLead("phone");
    window.location.href = links.phone;
  };

  const routes = useMemo(() => routesFrom(from, to, 300), [from, to]);
  const routesTitle = from ? `Куда едут из ${cityRod(from)}` : "Популярные направления";

  const faq: FaqItem[] = [
    { q: "Сколько стоит поездка?", a: "Зависит от расстояния и класса машины. Позвоните или напишите маршрут — диспетчер назовёт точную сумму за минуту. Она фиксируется и в дороге не меняется." },
    { q: "Можно поехать по городу или в соседний район?", a: `Нет, мы возим только между городами, от ${MIN_KM} км. Для поездок по городу лучше заказать обычное такси.` },
    { q: "Как быстро подадите машину?", a: "Обычно от 30 минут до 2 часов, зависит от города. Можно заказать заранее на нужную дату и время." },
  ];

  return (
    <main className="min-h-screen bg-[#0b0b0f] text-white pb-24" style={{ fontFamily: "Manrope, sans-serif" }}>
      <RuHero links={links} onLead={onLead} phone={PHONE} from={from} to={to} minKm={MIN_KM} />
      <RuStats />
      <RuWhat minKm={MIN_KM} />
      <RuRoutes routes={routes} title={routesTitle} onPick={callNow} />
      <RuSteps />
      <section className="px-5 py-4 max-w-xl mx-auto">
        <LpCta links={links} onLead={onLead} label="Узнать цену поездки" />
      </section>
      <RuWhy />
      <RuCars />
      <ReviewsSlider city={from ?? undefined} />
      <LpCalm />
      <LpFaq extra={faq} />
      <section className="px-5 py-8 max-w-xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold uppercase" style={{ fontFamily: "Oswald, sans-serif" }}>
          {from ? <>Едете из {cityRod(from)}?</> : <>Едете в другой город?</>}
        </h2>
        <p className="mt-2 mb-5 text-white/70 text-[15px]">Назовите маршрут, и через минуту узнаете цену</p>
        <LpCta links={links} onLead={onLead} />
      </section>
      <footer className="px-5 pb-6 text-center text-xs text-white/40">
        Такси Дальняк · междугородние перевозки по России · <a href="/privacy" className="underline">Конфиденциальность</a>
      </footer>
      <LpStickyBar links={links} onLead={onLead} />
    </main>
  );
}
