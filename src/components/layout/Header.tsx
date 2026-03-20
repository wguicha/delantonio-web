import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { useCartStore } from '../../store/cartStore';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const totalItems = useCartStore((s) => s.getTotalItems());

  const navLinks = [
    { href: '/#menu', label: 'Menú' },
    { href: '/#horarios', label: 'Horarios' },
    { href: '/#nosotros', label: 'Nosotros' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-rock-black/95 backdrop-blur-sm border-b border-rock-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" aria-label="Del Antonio - Inicio" className="pl-2" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Logo size="sm" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Navegación principal">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-rock-metal-light hover:text-rock-white transition-colors font-condensed uppercase tracking-wider text-sm"
                style={{ fontFamily: "'Roboto Condensed', sans-serif" }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Cart button */}
            <div className="relative">
              <Link
                to="/pedir"
                className="flex items-center gap-2 bg-rock-red hover:bg-rock-red-bright text-white px-4 py-2 font-rock tracking-wider text-sm transition-colors"
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.1em', clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)' }}
                aria-label={`Pedir - ${totalItems} artículos en el carrito`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                PEDIR
              </Link>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-rock-gold text-rock-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center pointer-events-none" aria-live="polite">
                  {totalItems}
                </span>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden text-rock-white p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <nav className="md:hidden border-t border-rock-border py-4" aria-label="Navegación móvil">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-4 py-3 text-rock-metal-light hover:text-rock-white hover:bg-rock-card transition-colors font-condensed uppercase tracking-wider"
                style={{ fontFamily: "'Roboto Condensed', sans-serif" }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
