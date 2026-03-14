import { Link } from 'react-router-dom';

export function CookiesPage() {
  return (
    <main className="pt-20 pb-16 px-4">
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
          POLÍTICA DE <span style={{ color: '#dc2626' }}>COOKIES</span>
        </h1>
        <p className="text-rock-metal text-sm mb-10">Última actualización: enero de 2025</p>

        <div className="space-y-8 text-rock-metal-light leading-relaxed">

          <section aria-labelledby="que-son">
            <h2 id="que-son" className="text-rock-white text-xl mb-3" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}>
              1. ¿QUÉ SON LAS COOKIES?
            </h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Sirven para recordar tus preferencias y mejorar tu experiencia de navegación.
            </p>
          </section>

          <section aria-labelledby="tipos">
            <h2 id="tipos" className="text-rock-white text-xl mb-3" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}>
              2. TIPOS DE COOKIES QUE USAMOS
            </h2>
            <div className="space-y-4">
              <div className="border border-rock-border p-4 bg-rock-card">
                <h3 className="text-rock-white font-semibold mb-1">🔒 Cookies Necesarias <span className="text-rock-metal text-xs">(Siempre activas)</span></h3>
                <p className="text-sm">Imprescindibles para el funcionamiento del sitio. Guardan el contenido del carrito y las preferencias de cookies. No pueden desactivarse.</p>
                <ul className="list-disc list-inside mt-2 text-xs space-y-1">
                  <li><code className="text-rock-gold">delantonio-cart</code> — Contenido del carrito (localStorage)</li>
                  <li><code className="text-rock-gold">delantonio-auth</code> — Sesión de administrador (localStorage)</li>
                  <li><code className="text-rock-gold">delantonio-cookie-consent</code> — Tus preferencias de cookies (localStorage)</li>
                </ul>
              </div>
              <div className="border border-rock-border p-4 bg-rock-card">
                <h3 className="text-rock-white font-semibold mb-1">📊 Cookies Analíticas <span className="text-rock-metal text-xs">(Opcionales)</span></h3>
                <p className="text-sm">Nos ayudan a entender cómo se usa el sitio (páginas visitadas, tiempo de sesión). Los datos son anónimos y agregados.</p>
              </div>
              <div className="border border-rock-border p-4 bg-rock-card">
                <h3 className="text-rock-white font-semibold mb-1">📢 Cookies de Marketing <span className="text-rock-metal text-xs">(Opcionales)</span></h3>
                <p className="text-sm">Permiten mostrar publicidad relevante en otras plataformas. Actualmente no están activadas.</p>
              </div>
            </div>
          </section>

          <section aria-labelledby="gestion">
            <h2 id="gestion" className="text-rock-white text-xl mb-3" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}>
              3. CÓMO GESTIONAR TUS COOKIES
            </h2>
            <p>
              Puedes cambiar tus preferencias en cualquier momento haciendo clic en el botón de abajo, o desde la configuración de tu navegador:
            </p>
            <ul className="list-disc list-inside mt-2 text-sm space-y-1">
              <li><strong className="text-rock-white">Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</li>
              <li><strong className="text-rock-white">Firefox:</strong> Preferencias → Privacidad y seguridad</li>
              <li><strong className="text-rock-white">Safari:</strong> Preferencias → Privacidad</li>
            </ul>
            <div className="mt-6">
              <button
                onClick={() => {
                  localStorage.removeItem('delantonio-cookie-consent');
                  window.location.reload();
                }}
                className="border border-rock-red text-rock-red hover:bg-rock-red hover:text-white px-5 py-2 text-sm transition-colors"
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}
              >
                RESTABLECER PREFERENCIAS DE COOKIES
              </button>
            </div>
          </section>

          <section aria-labelledby="contacto-cookies">
            <h2 id="contacto-cookies" className="text-rock-white text-xl mb-3" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}>
              4. CONTACTO
            </h2>
            <p>
              Para cualquier consulta sobre el uso de cookies, escríbenos a{' '}
              <strong className="text-rock-white">privacidad@pizzeriadelantonio.es</strong>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
