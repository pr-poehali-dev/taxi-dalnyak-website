interface Props {
  image: string;
  alt: string;
  title: string;
  text: string;
  reverse?: boolean;
}

export default function LpPhotoBlock({ image, alt, title, text }: Props) {
  return (
    <section className="px-5 py-6 max-w-xl mx-auto">
      <div className="overflow-hidden rounded-3xl" style={{ background: "#14141a", border: "1px solid rgba(255,255,255,0.08)" }}>
        <img src={image} alt={alt} loading="lazy" className="w-full aspect-[4/3] object-cover" />
        <div className="p-5">
          <h2 className="text-xl font-bold uppercase" style={{ fontFamily: "Oswald, sans-serif" }}>{title}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-white/80">{text}</p>
        </div>
      </div>
    </section>
  );
}
