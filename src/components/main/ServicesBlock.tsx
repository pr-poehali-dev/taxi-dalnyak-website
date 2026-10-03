const CDN = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/";

const SERVICES = [
  {
    title: "Заберём из любой точки России!",
    text: "Удобно заказать через любой мессенджер или просто позвонить — диспетчер на связи круглосуточно.",
    img: CDN + "4bc7d2c3-c750-44c9-b9a5-27ee9762e5bf.jpg",
  },
  {
    title: "Популярные маршруты",
    text: "Москва, Ростов-на-Дону, Донецк, Луганск, Мариуполь, Херсон, Волгоград, Краснодар, Самара, Саратов, Казань, Белгород, Воронеж, Курск, Санкт-Петербург, Нижний Новгород, Уфа и другие города.",
    img: CDN + "09623db9-de72-4fb9-a98c-434100063ec0.jpg",
  },
  {
    title: "Круглосуточный трансфер",
    text: "Заказать автомобиль можно на любое удобное время. При поездках с детьми бесплатно предоставим детское кресло или бустер. Также встречаем в аэропортах и на вокзалах.",
    img: CDN + "2d8fc63e-62bd-49d1-ab30-04be3c283c19.jpg",
  },
];

export default function ServicesBlock() {
  return (
    <section id="services" className="px-6 pt-12 pb-4 max-w-xl mx-auto scroll-mt-4">
      <h2 className="text-center text-2xl sm:text-3xl font-bold uppercase" style={{ fontFamily: "Oswald, sans-serif" }}>
        Наши услуги
      </h2>
      <div className="mt-8 space-y-12">
        {SERVICES.map((s) => (
          <article key={s.title}>
            <img src={s.img} alt={s.title} loading="lazy" className="w-full aspect-[4/3] object-cover rounded-sm" />
            <h3 className="mt-6 text-xl font-extrabold uppercase text-sky-400 leading-tight">{s.title}</h3>
            <p className="mt-3 text-base font-bold leading-relaxed text-white/90">{s.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
