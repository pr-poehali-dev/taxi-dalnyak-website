interface Props {
  className?: string;
  label?: string;
}

const RATING_URL = "https://yandex.ru/sprav/widget/rating-badge/82867613833?type=rating";

export default function YandexRating({ className = "", label = "Рейтинг организации в Яндексе" }: Props) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`} style={{ lineHeight: 0 }}>
      <iframe
        src={RATING_URL}
        width={150}
        height={50}
        frameBorder={0}
        loading="lazy"
        title="Рейтинг Такси Дальняк в Яндексе"
        style={{ border: "none", overflow: "hidden", colorScheme: "light", display: "block", borderRadius: 10 }}
      />
      {label && (
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10.5, textAlign: "center" }}>
          {label}
        </span>
      )}
    </div>
  );
}