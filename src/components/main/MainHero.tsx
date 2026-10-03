const HERO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/b9e41dff-bcd4-4590-98e3-349a9d051abb.jpg";

export default function MainHero() {
  return (
    <section id="home" className="relative h-[100svh] min-h-[560px] flex items-center justify-center text-center overflow-hidden">
      <img src={HERO} alt="Междугороднее такси Дальняк" className="absolute inset-0 w-full h-full object-cover object-[22%_center] sm:object-center" fetchPriority="high" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/35 to-black" />

      <div className="relative z-10 px-6 max-w-xl animate-fade-in">
        <img
          src="/logo-dalnyak.webp"
          alt="Такси Дальняк"
          width={600}
          height={371}
          className="w-44 mx-auto rounded-2xl mb-6 shadow-[0_0_40px_rgba(255,180,0,0.35)]"
        />
        <h1 className="font-bold uppercase tracking-wide text-3xl sm:text-4xl leading-tight drop-shadow-lg" style={{ fontFamily: "Oswald, sans-serif" }}>
          Такси межгород
        </h1>
        <a href="https://taxidalnyack.ru/" className="block text-xl sm:text-2xl font-bold mt-1 drop-shadow-lg">
          taxidalnyack.ru
        </a>

        <div className="w-48 h-[3px] bg-white/80 mx-auto my-8 rounded-full" />

        <p className="text-lg sm:text-xl font-bold leading-snug drop-shadow-lg">
          Междугороднее такси в любую точку России!
        </p>
        <p className="text-lg sm:text-xl font-extrabold uppercase leading-snug mt-1 drop-shadow-lg">
          А также на территории ДНР, ЛНР, Запорожье, Херсон
        </p>
      </div>
    </section>
  );
}
