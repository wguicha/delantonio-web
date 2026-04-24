import { createPortal } from 'react-dom';
import { useCartStore } from '../../store/cartStore';

interface Props {
  onClose: () => void;
}

function formatPrice(price: number): string {
  return price.toFixed(2).replace('.', ',') + '€';
}

export function SelectionModal({ onClose }: Props) {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const total = useCartStore((s) => s.getTotalPrice());

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md border border-rock-border bg-rock-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rock-border">
          <h2
            className="text-rock-white"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '1.4rem', letterSpacing: '0.1em' }}
          >
            TU SELECCIÓN
          </h2>
          <button
            onClick={onClose}
            className="text-rock-metal hover:text-rock-white transition-colors text-xl leading-none"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="px-6 py-4 max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-rock-metal text-sm text-center py-6">Nada seleccionado aún.</p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => {
                const price =
                  item.size === 'half'
                    ? (item.menuItem.priceHalf ?? 0)
                    : item.size === 'full'
                    ? (item.menuItem.priceFull ?? 0)
                    : (item.menuItem.price ?? 0);
                const sizeLabel = item.size === 'half' ? ' (Media)' : item.size === 'full' ? ' (Entera)' : '';
                return (
                  <li
                    key={`${item.menuItem.id}-${item.size ?? 'single'}`}
                    className="flex justify-between items-center text-sm border-b border-rock-border/40 pb-2"
                  >
                    <span className="text-rock-white" style={{ fontFamily: "'Roboto Condensed', sans-serif" }}>
                      {item.quantity}× {item.menuItem.name}{sizeLabel}
                    </span>
                    {price > 0 && (
                      <span className="text-rock-gold font-bold ml-4 shrink-0">
                        {formatPrice(price * item.quantity)}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-rock-border flex items-center justify-between gap-4">
            <div>
              <span className="text-rock-metal text-xs uppercase tracking-wider">Total aprox.</span>
              <div
                className="text-rock-gold font-bold"
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: '1.4rem' }}
              >
                {formatPrice(total)}
              </div>
            </div>
            <button
              onClick={() => { clearCart(); onClose(); }}
              className="text-rock-red hover:text-white border border-rock-red/50 hover:bg-rock-red px-4 py-2 text-sm transition-all"
              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}
            >
              LIMPIAR
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
