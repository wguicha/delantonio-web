import { Link } from 'react-router-dom';
import { useMenu } from '../hooks/useMenu';
import { MenuSection } from '../components/menu/MenuSection';

export function HomePage() {
  const { categories, loading } = useMenu();

  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #080808 0%, #1a0505 60%, #0a0a0a 100%)' }}
        aria-label="Sección principal"
      >
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(#dc2626 1px, transparent 1px), linear-gradient(90deg, #dc2626 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
          aria-hidden="true"
        />

        {/* Radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.12) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20 pb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 border border-rock-red/40 bg-rock-red/10 px-5 py-1.5 mb-10 text-rock-red/90 text-xs uppercase tracking-[0.3em]">
            <span aria-hidden="true">🎸</span> Pizzería Rock
          </div>

          {/* Main title */}
          <div className="relative inline-block">
            <img
              src="/tongue.png"
              alt=""
              aria-hidden="true"
              className="absolute object-contain drop-shadow-[0_0_16px_rgba(220,38,38,0.9)] rotate-12 z-10 pointer-events-none"
            style={{
              width: 'clamp(5rem, 20vw, 13.5rem)',
              height: 'clamp(5rem, 20vw, 13.5rem)',
              top: 0,
              right: 'clamp(2rem, 10vw, 7.5rem)',
            }}
            />
            <h1
              className="mb-2 leading-none"
              style={{
                fontFamily: "'Metal Mania', 'Bebas Neue', Impact, sans-serif",
                fontSize: 'clamp(5rem, 18vw, 12rem)',
                letterSpacing: '0.04em',
                color: '#f5f5f5',
                textShadow: '0 0 80px rgba(220,38,38,0.25), 0 4px 30px rgba(0,0,0,0.8)',
              }}
            >
              DEL{' '}
              <span style={{ color: '#dc2626', textShadow: '0 0 40px rgba(220,38,38,0.6)' }}>
                ANTONIO
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p
            className="text-rock-metal-light mb-3"
            style={{
              fontFamily: "'Roboto Condensed', sans-serif",
              fontSize: 'clamp(0.85rem, 2.5vw, 1.25rem)',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              textAlign: 'center',
              paddingLeft: '0.4em',
            }}
          >
            El sabor del rock hecho pizza
          </p>

          {/* Divider */}
          <div className="flex items-center justify-center gap-4 mb-8" aria-hidden="true">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-rock-red" />
            <span className="text-rock-red text-lg">✦</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-rock-red" />
          </div>

          <p
            className="text-rock-metal text-sm sm:text-base leading-relaxed"
            style={{ textAlign: 'center', maxWidth: '32rem', margin: '0 auto 2.5rem' }}
          >
            Pizzas artesanas con actitud. Metallica, Iron Maiden, AC/DC...
            Cada pizza lleva el alma de una leyenda del rock.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/pedir"
              className="inline-flex items-center justify-center gap-2 bg-rock-red hover:bg-rock-red-bright text-white transition-all hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]"
              style={{
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                fontSize: '1.4rem',
                letterSpacing: '0.1em',
                padding: '1rem 2.5rem',
                clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)',
              }}
            >
              🍕 PEDIR AHORA
            </Link>
            <a
              href="#menu"
              className="inline-flex items-center justify-center gap-2 border-2 border-rock-gold text-rock-gold hover:bg-rock-gold hover:text-rock-black transition-all"
              style={{
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                fontSize: '1.4rem',
                letterSpacing: '0.1em',
                padding: '1rem 2.5rem',
                clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)',
              }}
            >
              VER MENÚ
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto mt-14 border-t border-rock-border/50 pt-10">
            {[
              { value: '+40', label: 'Pizzas' },
              { value: '100%', label: 'Artesanas' },
              { value: '🤘', label: 'Rock' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div
                  className="text-rock-red mb-1"
                  style={{
                    fontFamily: "'Bebas Neue', Impact, sans-serif",
                    fontSize: '2rem',
                    letterSpacing: '0.05em',
                  }}
                >
                  {value}
                </div>
                <div className="text-rock-metal text-xs uppercase tracking-widest">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
          <svg className="w-6 h-6 text-rock-metal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── MENU ─────────────────────────────────────────── */}
      <section id="menu" className="py-20 px-4" aria-label="Menú completo">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-14">
            <p
              className="text-rock-red/70 text-xs uppercase tracking-[0.4em] mb-3"
              style={{ fontFamily: "'Roboto Condensed', sans-serif" }}
            >
              Lo que ofrecemos
            </p>
            <h2
              className="text-rock-white leading-none mb-4"
              style={{
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                fontSize: 'clamp(2.5rem, 7vw, 5rem)',
                letterSpacing: '0.08em',
              }}
            >
              NUESTRO <span style={{ color: '#dc2626' }}>MENÚ</span>
            </h2>
            <div className="flex items-center justify-center gap-3 mb-4" aria-hidden="true">
              <div className="h-px w-12 bg-rock-red/60" />
              <div className="w-1.5 h-1.5 bg-rock-red rotate-45" />
              <div className="h-px w-12 bg-rock-red/60" />
            </div>
            <p className="text-rock-metal-light max-w-xl mx-auto text-sm">
              Añade tus platos favoritos al carrito y recógelos cuando estén listos
            </p>
          </div>

          <MenuSection categories={categories} loading={loading} />

          {/* CTA below menu */}
          <div className="text-center mt-12">
            <Link
              to="/pedir"
              className="inline-flex items-center justify-center gap-2 bg-rock-red hover:bg-rock-red-bright text-white transition-all hover:scale-[1.03]"
              style={{
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                fontSize: '1.3rem',
                letterSpacing: '0.1em',
                padding: '0.9rem 2.5rem',
                clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)',
              }}
            >
              🛒 VER CARRITO Y PEDIR
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOURS ────────────────────────────────────────── */}
      <section
        id="horarios"
        className="py-20 px-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #080808 0%, #111111 50%, #080808 100%)' }}
        aria-label="Horarios"
      >
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #dc2626 0px, #dc2626 1px, transparent 0px, transparent 10px)',
            backgroundSize: '14px 14px',
          }}
          aria-hidden="true"
        />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2
              className="text-rock-white leading-none"
              style={{
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                letterSpacing: '0.1em',
              }}
            >
              HORARIOS & <span style={{ color: '#dc2626' }}>CONTACTO</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Hours card */}
            <div className="border border-rock-border bg-rock-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl" aria-hidden="true">🕐</span>
                <h3
                  className="text-rock-white"
                  style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '1.5rem', letterSpacing: '0.1em' }}
                >
                  HORARIO
                </h3>
              </div>
              <dl className="space-y-3">
                <div className="border-b border-rock-border pb-3">
                  <div className="flex justify-between items-start gap-3 mb-1.5">
                    <dt className="text-rock-metal-light text-sm" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>
                      Domingos
                    </dt>
                    <dd className="text-rock-gold font-bold text-right" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>
                      12:00 – 16:00
                    </dd>
                  </div>
                  <div className="flex justify-between items-start gap-3">
                    <dt />
                    <dd className="text-rock-gold font-bold text-right" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>
                      20:00 – 00:00
                    </dd>
                  </div>
                </div>
                <div className="border-b border-rock-border pb-3">
                  <div className="flex justify-between items-start gap-3 mb-1.5">
                    <dt className="text-rock-metal-light text-sm" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>
                      Martes – Sábados
                    </dt>
                    <dd className="text-rock-gold font-bold text-right" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>
                      12:00 – 16:00
                    </dd>
                  </div>
                  <div className="flex justify-between items-start gap-3">
                    <dt />
                    <dd className="text-rock-gold font-bold text-right" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>
                      20:00 – 02:00
                    </dd>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <dt className="text-rock-metal text-sm" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>
                      Lunes
                    </dt>
                    <dd className="text-rock-metal text-sm italic">Cerrado (excepto festivos)</dd>
                  </div>
                </div>
              </dl>
              <p className="text-rock-metal text-xs mt-6 border-t border-rock-border pt-4">
                * Los pedidos deben realizarse con al menos 30 minutos de antelación.
              </p>
            </div>

            {/* Location card */}
            <div className="border border-rock-border bg-rock-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl" aria-hidden="true">📍</span>
                <h3
                  className="text-rock-white"
                  style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '1.5rem', letterSpacing: '0.1em' }}
                >
                  UBICACIÓN
                </h3>
              </div>
              <address className="not-italic space-y-3">
                <p className="text-rock-white" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>
                  Pizzería Del Antonio
                </p>
                <p className="text-rock-metal-light text-sm">Pl. Autonomía, 25</p>
                <p className="text-rock-metal-light text-sm">23730 Villanueva de la Reina, Jaén</p>
              </address>
              <div className="mt-6 border-t border-rock-border pt-4 space-y-2">
                <p className="text-rock-metal-light text-sm">
                  Solo pedidos para recoger en local
                </p>
                <p
                  className="text-rock-red text-xs uppercase tracking-wider"
                  style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}
                >
                  🎸 Sin delivery · Solo take away
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NOSOTROS ─────────────────────────────────────── */}
      <section id="nosotros" className="py-20 px-4" aria-label="Sobre nosotros">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-rock-white mb-6 leading-none"
            style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              letterSpacing: '0.1em',
            }}
          >
            ROCK, PIZZA &{' '}
            <span style={{ color: '#dc2626' }}>PASIÓN</span>
          </h2>
          <div className="flex items-center justify-center gap-3 mb-8" aria-hidden="true">
            <div className="h-px w-12 bg-rock-red/60" />
            <div className="w-1.5 h-1.5 bg-rock-red rotate-45" />
            <div className="h-px w-12 bg-rock-red/60" />
          </div>
          <p className="text-rock-metal-light text-base leading-relaxed max-w-2xl mx-auto mb-10">
            En Del Antonio no hacemos pizzas genéricas. Cada receta lleva el nombre de
            una banda legendaria porque, como el buen rock, está hecha con ingredientes
            auténticos, actitud y sin compromisos.
            <br /><br />
            Masa artesanal, ingredientes frescos y el volumen siempre al máximo.
          </p>
          <Link
            to="/pedir"
            className="inline-flex items-center justify-center gap-2 bg-rock-red hover:bg-rock-red-bright text-white transition-all hover:scale-[1.03]"
            style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: '1.3rem',
              letterSpacing: '0.1em',
              padding: '0.9rem 2.5rem',
              clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)',
            }}
          >
            🍕 HAZ TU PEDIDO
          </Link>
        </div>
      </section>
    </main>
  );
}
