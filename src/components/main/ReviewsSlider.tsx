import Icon from "@/components/ui/icon";
import { REVIEWS } from "@/lib/reviews";

export default function ReviewsSlider({ city }: { city?: string } = {}) {
  const key = (city || "").toLowerCase().slice(0, 5);
  const sorted = key ? [...REVIEWS].sort((a, b) => Number(b.route.toLowerCase().includes(key)) - Number(a.route.toLowerCase().includes(key))) : REVIEWS;
  const list = sorted.slice(0, 12);

  return (
    <section id="reviews" className="pt-12 pb-8 scroll-mt-4">
      <div className="flex items-center justify-between px-6 max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: "Oswald, sans-serif" }}>
          Отзывы клиентов
        </h2>
        <Icon name="Hand" size={22} className="text-white/60 animate-pulse" />
      </div>

      <div className="mt-6 flex gap-4 overflow-x-auto snap-x snap-mandatory px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {list.map((r) => (
          <article
            key={r.name + r.route}
            className="snap-center shrink-0 w-[84%] max-w-sm rounded-sm p-6 flex flex-col"
            style={{ background: "#f4f4f7", color: "#2a2a33" }}
          >
            <div className="flex items-center gap-3">
              <span
                className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
                style={{ background: "linear-gradient(135deg,#fcd34d,#f59e0b)", color: "#111" }}
              >
                {r.name.charAt(0)}
              </span>
              <div className="min-w-0">
                <div className="font-bold leading-tight">{r.name}</div>
                <div className="text-xs mt-0.5" style={{ color: "#6b6b78" }}>{r.route}</div>
              </div>
            </div>
            <div className="flex gap-0.5 mt-4" aria-label={`${r.stars ?? 5} из 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon key={i} name="Star" size={16} style={{ color: i < (r.stars ?? 5) ? "#f59e0b" : "#c9c9d2", fill: i < (r.stars ?? 5) ? "#f59e0b" : "none" }} />
              ))}
            </div>
            <p className="mt-3 text-[15px] leading-relaxed">{r.text}</p>
          </article>
        ))}
      </div>

      <div className="text-center mt-2">
        <a href="/reviews" className="inline-flex items-center gap-1.5 text-sm font-bold text-sky-400 underline underline-offset-4">
          Все отзывы <Icon name="ChevronRight" size={16} />
        </a>
      </div>
    </section>
  );
}
