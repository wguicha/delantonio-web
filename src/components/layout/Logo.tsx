export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { img: 'w-7 h-7', text: 'text-xl', sub: 'text-[0.6rem]' },
    md: { img: 'w-12 h-12', text: 'text-5xl', sub: 'text-sm' },
    lg: { img: 'w-20 h-20', text: 'text-7xl', sub: 'text-base' },
  };

  // Header (sm): horizontal layout — icon left, text right
  if (size === 'sm') {
    return (
      <div className="flex items-center gap-2 leading-none select-none">
        <img
          src="/tongue.png"
          alt=""
          aria-hidden="true"
          className={sizes.sm.img}
          style={{ objectFit: 'contain' }}
        />
        <div className="flex flex-col">
          <span
            className={`${sizes.sm.text} text-rock-white`}
            style={{ fontFamily: "'Metal Mania', 'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em', lineHeight: 1 }}
          >
            DEL ANTONIO
          </span>
          <span
            className={`${sizes.sm.sub} text-rock-gold tracking-[0.25em] uppercase`}
            style={{ fontFamily: "'Roboto Condensed', sans-serif" }}
          >
            Pizzería Rock
          </span>
        </div>
      </div>
    );
  }

  // md / lg: stacked layout
  return (
    <div className="flex flex-col items-center leading-none select-none">
      <img
        src="/tongue.png"
        alt=""
        aria-hidden="true"
        className={sizes[size].img}
        style={{ objectFit: 'contain' }}
      />
      <span
        className={`font-rock ${sizes[size].text} text-rock-white tracking-widest`}
        style={{ fontFamily: "'Metal Mania', 'Bebas Neue', Impact, sans-serif", letterSpacing: '0.1em' }}
      >
        DEL ANTONIO
      </span>
      <span
        className={`${sizes[size].sub} text-rock-gold tracking-[0.3em] uppercase`}
        style={{ fontFamily: "'Roboto Condensed', sans-serif" }}
      >
        Pizzería Rock
      </span>
    </div>
  );
}
