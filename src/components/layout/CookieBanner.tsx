import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

type ConsentState = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const CONSENT_KEY = 'delantonio-cookie-consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<ConsentState>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  const saveConsent = (consentData: ConsentState) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      ...consentData,
      timestamp: new Date().toISOString(),
      version: '1.0',
    }));
    setVisible(false);
  };

  const acceptAll = () => {
    const full = { necessary: true, analytics: true, marketing: true };
    setConsent(full);
    saveConsent(full);
  };

  const rejectOptional = () => {
    const minimal = { necessary: true, analytics: false, marketing: false };
    setConsent(minimal);
    saveConsent(minimal);
  };

  const saveCustom = () => saveConsent(consent);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
    >
      <div className="max-w-4xl mx-auto bg-rock-card border border-rock-border shadow-2xl">
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl" aria-hidden="true">🍪</span>
            <div>
              <h2 className="font-rock text-rock-white text-xl tracking-wider mb-1" style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
                COOKIES Y PRIVACIDAD
              </h2>
              <p className="text-rock-metal-light text-sm">
                Usamos cookies para mejorar tu experiencia. Las cookies necesarias son imprescindibles para el funcionamiento del sitio.{' '}
                <Link to="/cookies" className="text-rock-red hover:underline">
                  Política de Cookies
                </Link>
              </p>
            </div>
          </div>

          {showDetails && (
            <div className="mb-4 space-y-3 border-t border-rock-border pt-4">
              {[
                {
                  key: 'necessary' as const,
                  label: 'Necesarias',
                  desc: 'Imprescindibles para el funcionamiento. No se pueden desactivar.',
                  disabled: true,
                },
                {
                  key: 'analytics' as const,
                  label: 'Analíticas',
                  desc: 'Nos ayudan a entender cómo usas el sitio (datos anonimizados).',
                  disabled: false,
                },
                {
                  key: 'marketing' as const,
                  label: 'Marketing',
                  desc: 'Para mostrarte contenido relevante en otras plataformas.',
                  disabled: false,
                },
              ].map(({ key, label, desc, disabled }) => (
                <label key={key} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent[key]}
                    disabled={disabled}
                    onChange={(e) => setConsent((prev) => ({ ...prev, [key]: e.target.checked }))}
                    className="mt-1 accent-rock-red"
                  />
                  <div>
                    <span className="text-rock-white text-sm font-semibold">{label}</span>
                    {disabled && <span className="text-rock-metal text-xs ml-2">(Siempre activas)</span>}
                    <p className="text-rock-metal-light text-xs">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-end">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-rock-metal-light hover:text-rock-white text-sm underline transition-colors"
            >
              {showDetails ? 'Ocultar opciones' : 'Personalizar'}
            </button>
            <button
              onClick={rejectOptional}
              className="px-4 py-2 border border-rock-border text-rock-metal-light hover:text-rock-white hover:border-rock-metal transition-colors text-sm"
            >
              Solo necesarias
            </button>
            {showDetails && (
              <button
                onClick={saveCustom}
                className="px-4 py-2 border border-rock-gold text-rock-gold hover:bg-rock-gold hover:text-rock-black transition-colors text-sm font-semibold"
              >
                Guardar selección
              </button>
            )}
            <button
              onClick={acceptAll}
              className="px-4 py-2 bg-rock-red hover:bg-rock-red-bright text-white text-sm font-semibold transition-colors"
            >
              Aceptar todas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
