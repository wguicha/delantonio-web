import { Link } from 'react-router-dom';

export function LegalPage() {
  return (
    <main className="pt-28 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="text-rock-red hover:text-rock-red-bright text-sm transition-colors">
            ← Volver al inicio
          </Link>
        </div>

        <h1
          className="text-rock-white mb-2"
          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '3rem', letterSpacing: '0.08em' }}
        >
          AVISO <span style={{ color: '#dc2626' }}>LEGAL</span>
        </h1>
        <p className="text-rock-metal text-sm mb-10">Última actualización: enero de 2025</p>

        <div className="space-y-8 text-rock-metal-light leading-relaxed">

          <section aria-labelledby="titular">
            <h2 id="titular" className="text-rock-white text-xl mb-3" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}>
              1. TITULAR DEL SITIO WEB
            </h2>
            <p>
              <strong className="text-rock-white">Pizzería Del Antonio</strong><br />
              Actividad: Restauración — Pizzería<br />
              Dirección: Málaga, España<br />
              Email: info@pizzeriadelantonio.es
            </p>
          </section>

          <section aria-labelledby="objeto">
            <h2 id="objeto" className="text-rock-white text-xl mb-3" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}>
              2. OBJETO Y ACEPTACIÓN
            </h2>
            <p>
              El presente Aviso Legal regula el uso del sitio web <strong className="text-rock-white">pizzeriadelantonio.es</strong>. El uso del sitio implica la aceptación plena y sin reservas de este aviso legal.
            </p>
          </section>

          <section aria-labelledby="propiedad">
            <h2 id="propiedad" className="text-rock-white text-xl mb-3" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}>
              3. PROPIEDAD INTELECTUAL
            </h2>
            <p>
              Todos los contenidos del sitio web (textos, imágenes, diseño, logotipos) son propiedad de Pizzería Del Antonio y están protegidos por la legislación de propiedad intelectual vigente en España. Queda prohibida su reproducción sin autorización expresa.
            </p>
            <p className="mt-2 text-sm">
              Los nombres de bandas musicales (Metallica, Iron Maiden, AC/DC, etc.) se usan con carácter descriptivo y comercial como nombres de platos del menú.
            </p>
          </section>

          <section aria-labelledby="responsabilidad">
            <h2 id="responsabilidad" className="text-rock-white text-xl mb-3" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}>
              4. LIMITACIÓN DE RESPONSABILIDAD
            </h2>
            <p>
              Pizzería Del Antonio no se hace responsable de los daños ocasionados por interrupciones del servicio, errores en la información del sitio web o mal uso del mismo por parte del usuario.
            </p>
          </section>

          <section aria-labelledby="legislacion">
            <h2 id="legislacion" className="text-rock-white text-xl mb-3" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}>
              5. LEGISLACIÓN APLICABLE
            </h2>
            <p>
              Este aviso legal se rige por la legislación española y la normativa europea aplicable, especialmente el Reglamento General de Protección de Datos (RGPD) y la Ley 34/2002 de Servicios de la Sociedad de la Información (LSSI).
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
