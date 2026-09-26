export default function Marquee({ images, speed = 55 }) {
  const items = images || [];
  const row = [...items, ...items];
  return (
    <div className="marquee py-6" data-testid="photo-marquee">
      <div className="marquee-track gap-5 pr-5" style={{ animationDuration: `${speed}s` }}>
        {row.map((img, i) => (
          <figure key={i} className="relative flex-none w-72 h-48 md:w-96 md:h-60 rounded-xl overflow-hidden group">
            <img
              src={img.image || img}
              alt={img.caption || "Sarah Toscano live"}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090D]/80 via-transparent to-transparent" />
            {img.caption && (
              <figcaption className="absolute bottom-3 left-3 font-mono2 text-[10px] uppercase tracking-widest text-pink-300">
                {img.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
}

export function TextMarquee({ items, speed = 32 }) {
  const row = [...items, ...items, ...items];
  return (
    <div className="marquee py-10 border-y border-white/5" data-testid="text-marquee">
      <div className="text-marquee-track items-center" style={{ animationDuration: `${speed}s` }}>
        {row.map((t, i) => (
          <span key={i} className="flex items-center flex-none">
            <span className={`font-display font-bold uppercase text-4xl md:text-6xl tracking-tight px-6 ${i % 2 === 0 ? "text-stroke" : "text-[#E10078]"}`}>
              {t}
            </span>
            <span className="text-[#E6C200] text-2xl">★</span>
          </span>
        ))}
      </div>
    </div>
  );
}
