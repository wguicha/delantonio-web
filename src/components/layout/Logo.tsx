export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { text: 'text-3xl', sub: 'text-xs' },
    md: { text: 'text-5xl', sub: 'text-sm' },
    lg: { text: 'text-7xl', sub: 'text-base' },
  };

  return (
    <div className="flex flex-col items-center leading-none select-none">
      {/* Tongue SVG inspired by Rolling Stones */}
      <svg
        viewBox="0 0 60 30"
        className={size === 'sm' ? 'w-8 h-4' : size === 'md' ? 'w-12 h-6' : 'w-20 h-10'}
        aria-hidden="true"
      >
        {/* Lips */}
        <path
          d="M5 8 Q30 2 55 8 Q30 16 5 8Z"
          fill="#dc2626"
          stroke="#991b1b"
          strokeWidth="0.5"
        />
        {/* Tongue */}
        <path
          d="M20 12 Q30 10 40 12 Q38 26 30 28 Q22 26 20 12Z"
          fill="#dc2626"
          stroke="#991b1b"
          strokeWidth="0.5"
        />
        {/* Tongue groove */}
        <path
          d="M30 14 Q30 26 30 27"
          stroke="#991b1b"
          strokeWidth="1"
          fill="none"
        />
      </svg>
      <span
        className={`font-rock ${sizes[size].text} text-rock-white tracking-widest`}
        style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.1em' }}
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
