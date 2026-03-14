import { useState } from 'react';
import type { MenuItem } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { ROCK_BAND_PIZZAS } from '../../data/menuData';

interface MenuItemCardProps {
  item: MenuItem;
  categorySlug: string;
}

function formatPrice(price: number): string {
  return price.toFixed(2).replace('.', ',') + '€';
}

export function MenuItemCard({ item, categorySlug }: MenuItemCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState<string | null>(null);

  const isRockPizza = categorySlug === 'pizzas' && ROCK_BAND_PIZZAS.has(item.name);
  const isRacion = categorySlug === 'raciones';
  const hasHalfFull = isRacion && (item.priceHalf != null || item.priceFull != null);

  function handleAdd(size?: 'half' | 'full') {
    addItem(item, 1, size);
    const key = size ?? 'single';
    setAdded(key);
    setTimeout(() => setAdded(null), 1500);
  }

  return (
    <article
      className="relative flex flex-col bg-rock-card border border-rock-border hover:border-rock-red/50 transition-all duration-200 group overflow-hidden"
      aria-label={`${item.name}${item.description ? ` - ${item.description}` : ''}`}
    >
      {/* Rock band badge */}
      {isRockPizza && (
        <div
          className="absolute top-0 right-0 bg-rock-red text-white text-xs px-2 py-0.5 z-10"
          style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.1em' }}
          aria-label="Especialidad rock"
        >
          🎸 ROCK
        </div>
      )}

      {/* Red accent line on hover */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-rock-red scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top" aria-hidden="true" />

      <div className="p-5 flex flex-col flex-1">
        {/* Name */}
        <h3
          className="text-rock-white mb-2 leading-tight"
          style={{
            fontFamily: "'Bebas Neue', Impact, sans-serif",
            fontSize: '1.25rem',
            letterSpacing: '0.05em',
          }}
        >
          {item.name}
        </h3>

        {/* Description/Ingredients */}
        {item.description && (
          <p className="text-rock-metal-light text-xs mb-3 leading-relaxed flex-1">
            {item.description}
          </p>
        )}

        <div className="mt-auto">
          {/* Simple price */}
          {!hasHalfFull && item.price != null && (
            <div className="flex items-center justify-between gap-2">
              <span
                className="text-rock-gold font-bold"
                style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: '1.1rem' }}
              >
                {formatPrice(item.price)}
              </span>
              <button
                onClick={() => handleAdd()}
                className="flex items-center gap-1 bg-rock-red/10 hover:bg-rock-red border border-rock-red/50 hover:border-rock-red text-rock-red hover:text-white px-3 py-1.5 text-xs transition-all duration-150"
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}
                aria-label={`Añadir ${item.name} al carrito`}
              >
                {added === 'single' ? (
                  <span className="text-green-400">✓ AÑADIDO</span>
                ) : (
                  <>
                    <span aria-hidden="true">+</span> AÑADIR
                  </>
                )}
              </button>
            </div>
          )}

          {/* No price */}
          {!hasHalfFull && item.price == null && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-rock-metal text-xs italic">Consultar precio</span>
              <button
                onClick={() => handleAdd()}
                className="flex items-center gap-1 bg-rock-red/10 hover:bg-rock-red border border-rock-red/50 hover:border-rock-red text-rock-red hover:text-white px-3 py-1.5 text-xs transition-all duration-150"
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}
                aria-label={`Añadir ${item.name} al carrito`}
              >
                {added === 'single' ? <span className="text-green-400">✓</span> : <><span aria-hidden="true">+</span> AÑADIR</>}
              </button>
            </div>
          )}

          {/* Half / Full prices */}
          {hasHalfFull && (
            <div className="flex flex-col gap-2">
              {item.priceHalf != null && (
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-rock-metal text-xs">Media</span>
                    <span
                      className="text-rock-gold font-bold ml-2"
                      style={{ fontFamily: "'Roboto Condensed', sans-serif" }}
                    >
                      {formatPrice(item.priceHalf)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAdd('half')}
                    className="bg-rock-red/10 hover:bg-rock-red border border-rock-red/50 hover:border-rock-red text-rock-red hover:text-white px-3 py-1 text-xs transition-all duration-150"
                    style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}
                    aria-label={`Añadir media ración de ${item.name}`}
                  >
                    {added === 'half' ? '✓' : '+ MEDIA'}
                  </button>
                </div>
              )}
              {item.priceFull != null && (
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-rock-metal text-xs">Entera</span>
                    <span
                      className="text-rock-gold font-bold ml-2"
                      style={{ fontFamily: "'Roboto Condensed', sans-serif" }}
                    >
                      {formatPrice(item.priceFull)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAdd('full')}
                    className="bg-rock-red/10 hover:bg-rock-red border border-rock-red/50 hover:border-rock-red text-rock-red hover:text-white px-3 py-1 text-xs transition-all duration-150"
                    style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.08em' }}
                    aria-label={`Añadir ración entera de ${item.name}`}
                  >
                    {added === 'full' ? '✓' : '+ ENTERA'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
