import Icon from "@/components/ui/icon";

const CDN = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/";

const TARIFFS = [
  { name: "Тариф Стандарт", rate: 32, cars: "Hyundai Solaris, Volkswagen Polo, Kia Rio и подобные", img: CDN + "9a5b696c-ac6b-4f6a-ad75-461264fe2fb5.jpg" },
  { name: "Тариф Комфорт", rate: 37, cars: "Kia Cerato, Hyundai Elantra, Haval Jolion и другие", img: CDN + "6e7613e4-7295-4e9b-a12b-977597e9f88f.jpg" },
  { name: "Тариф Комфорт+", rate: 42, cars: "Toyota Camry, Kia K5, Chery Arrizo 8 и другие", img: CDN + "55a9488f-349e-4910-a45d-0fd5ece7ba3e.jpg" },
  { name: "Тариф Минивэн", rate: 57, cars: "Hyundai Staria, Kia Carnival — до 7 пассажиров", img: CDN + "a2f291db-b1aa-48db-9a9b-4565b88c2d58.jpg" },
];

interface Props {
  orderHref: string;
  onOrder: () => void;
}

export default function TariffSlider({ orderHref, onOrder }: Props) {
  return (
    <section id="tariffs" className="pt-10 pb-6 scroll-mt-4">
      <h2 className="text-center text-2xl sm:text-3xl font-bold uppercase leading-tight px-6" style={{ fontFamily: "Oswald, sans-serif" }}>
        Автомобили разных классов:
      </h2>
      <div className="flex justify-end px-6 mt-3 text-white/60 text-xs items-center gap-1">
        листайте <Icon name="Hand" size={16} className="animate-pulse" />
      </div>

      <div className="mt-3 flex gap-4 overflow-x-auto snap-x snap-mandatory px-[8%] pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TARIFFS.map((t) => (
          <article key={t.name} className="snap-center shrink-0 w-[84%] max-w-sm">
            <img src={t.img} alt={`${t.name} — ${t.cars}`} loading="lazy" className="w-full aspect-[4/4.4] object-cover rounded-sm" />
            <h3 className="mt-5 text-lg font-extrabold uppercase">{t.name}</h3>
            <p className="mt-2 text-sm font-bold text-white/90 leading-snug">
              от {t.rate} руб/км ({t.cars})
            </p>
            <a
              href={orderHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onOrder}
              className="inline-block mt-5 px-7 py-3.5 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-bold uppercase text-sm shadow-[0_6px_20px_rgba(124,58,237,0.5)] transition"
            >
              Заказать
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
