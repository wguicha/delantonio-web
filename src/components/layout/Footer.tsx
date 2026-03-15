import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-rock-dark border-t border-rock-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col items-start gap-4">
            <Logo size="sm" />
            <p className="text-rock-metal-light text-sm max-w-xs">
              El sabor del rock hecho pizza. Ingredientes frescos, actitud rockera.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-rock text-rock-white text-xl mb-4 tracking-wider" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
              NAVEGACIÓN
            </h3>
            <nav aria-label="Footer navigation">
              <ul className="space-y-2">
                {[
                  { href: '/#menu', label: 'Menú' },
                  { href: '/#horarios', label: 'Horarios' },
                  { href: '/pedir', label: 'Hacer pedido' },
                ].map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-rock-metal-light hover:text-rock-red transition-colors text-sm font-condensed"
                      style={{ fontFamily: "'Roboto Condensed', sans-serif" }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-rock text-rock-white text-xl mb-4 tracking-wider" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
              LEGAL
            </h3>
            <nav aria-label="Legal navigation">
              <ul className="space-y-2">
                {[
                  { to: '/privacidad', label: 'Política de Privacidad' },
                  { to: '/aviso-legal', label: 'Aviso Legal' },
                  { to: '/cookies', label: 'Política de Cookies' },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-rock-metal-light hover:text-rock-red transition-colors text-sm font-condensed"
                      style={{ fontFamily: "'Roboto Condensed', sans-serif" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="border-t border-rock-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-rock-metal text-xs">
            © {currentYear} Pizzería Del Antonio. Todos los derechos reservados.
          </p>
          <p className="text-rock-metal text-xs">
            Hecho con 🎸 y mucha mozzarella
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-rock-border/50 text-center">
          <p className="text-rock-metal text-xs">
            Sitio web realizado por{' '}
            <a
              href="https://github.com/wguicha"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rock-red hover:text-rock-red-bright transition-colors"
            >
              WilliamGDev
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
