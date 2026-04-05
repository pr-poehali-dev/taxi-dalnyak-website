import { useEffect, useState } from "react";

const LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/eed871f1-fcfc-4342-ba10-6d3337b98fe4.jpg";

interface SplashScreenProps {
  onDone: () => void;
}

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const [phase, setPhase] = useState<"enter" | "show" | "exit">("enter");

  useEffect(() => {
    // Фаза 1: логотип появляется (0.6s)
    const t1 = setTimeout(() => setPhase("show"), 600);
    // Фаза 2: показываем текст — держим 4 секунды (достаточно для чтения)
    const t2 = setTimeout(() => setPhase("exit"), 4800);
    // Фаза 3: убираем сплэш
    const t3 = setTimeout(() => onDone(), 5500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
      style={{
        transition: "opacity 0.7s ease",
        opacity: phase === "exit" ? 0 : 1,
        pointerEvents: phase === "exit" ? "none" : "all",
      }}
    >
      {/* Зернистость */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Логотип */}
      <div
        style={{
          transition: "transform 0.7s cubic-bezier(0.34,1.56,0.64,1), opacity 0.7s ease",
          opacity: phase === "enter" ? 0 : 1,
          transform: phase === "enter" ? "scale(0.8) translateY(20px)" : "scale(1) translateY(0)",
        }}
        className="flex flex-col items-center gap-8"
      >
        <img
          src={LOGO}
          alt="Такси Дальняк"
          className="w-48 h-48 md:w-56 md:h-56 object-contain rounded-2xl shadow-2xl"
        />

        {/* Разделитель */}
        <div
          style={{
            transition: "width 1s ease 0.5s",
            width: phase === "show" ? "80px" : "0px",
          }}
          className="h-px bg-amber overflow-hidden"
        />

        {/* Текст */}
        <div
          style={{
            transition: "opacity 0.8s ease 0.8s, transform 0.8s ease 0.8s",
            opacity: phase === "show" ? 1 : 0,
            transform: phase === "show" ? "translateY(0)" : "translateY(12px)",
          }}
          className="text-center max-w-xs px-6"
        >
          <p className="font-oswald font-light text-white text-lg md:text-xl tracking-wide leading-relaxed mb-3">
            Сервис заказа такси<br />на дальние поездки
          </p>
          <p className="font-golos text-amber text-sm md:text-base leading-relaxed">
            Оформить поездку можно прямо в чате — напишите нам прямо сейчас
          </p>
        </div>

        {/* Прогресс-бар */}
        <div className="w-32 h-0.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber rounded-full"
            style={{
              transition: phase === "show" ? "width 3.8s linear" : "none",
              width: phase === "show" ? "100%" : "0%",
            }}
          />
        </div>
      </div>
    </div>
  );
}
