import { useState } from 'react';
import type { Category } from '../../types';
import { MenuItemCard } from './MenuItemCard';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface MenuSectionProps {
  categories: Category[];
  loading: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  ensaladas: '🥗',
  bocatas: '🥖',
  'camperos-familiares': '🍔',
  camperos: '🥪',
  raciones: '🍖',
  pizzas: '🍕',
};

export function MenuSection({ categories, loading }: MenuSectionProps) {
  const [activeSlug, setActiveSlug] = useState<string>('pizzas');

  const activeCategory = categories.find((c) => c.slug === activeSlug) ?? categories[0];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24" role="status" aria-label="Cargando menú">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!activeCategory) return null;

  return (
    <div>
      {/* Category tabs */}
      <div
        className="flex flex-wrap justify-center gap-2 mb-10"
        role="tablist"
        aria-label="Categorías del menú"
      >
        {categories.map((cat) => {
          const isActive = cat.slug === activeSlug;
          return (
            <button
              key={cat.slug}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${cat.slug}`}
              id={`tab-${cat.slug}`}
              onClick={() => setActiveSlug(cat.slug)}
              className={`flex items-center gap-2 px-4 py-2 border transition-all duration-150 text-sm ${
                isActive
                  ? 'bg-rock-red border-rock-red text-white'
                  : 'border-rock-border text-rock-metal-light hover:border-rock-red/50 hover:text-rock-white'
              }`}
              style={{
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                letterSpacing: '0.08em',
                clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)',
              }}
            >
              <span aria-hidden="true">{CATEGORY_ICONS[cat.slug] ?? '🍽️'}</span>
              {cat.name.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Category panel */}
      <div
        id={`panel-${activeCategory.slug}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeCategory.slug}`}
      >
        {/* Category description/note */}
        {activeCategory.description && (
          <div className="mb-6 border-l-2 border-rock-gold pl-4 text-rock-metal-light text-sm italic max-w-3xl mx-auto">
            <span aria-hidden="true">ℹ️ </span>
            {activeCategory.description}
          </div>
        )}

        {/* Items grid */}
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
          }}
        >
          {activeCategory.items.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              categorySlug={activeCategory.slug}
            />
          ))}
        </div>

        {activeCategory.items.length === 0 && (
          <p className="text-center text-rock-metal py-12">
            No hay artículos disponibles en esta categoría.
          </p>
        )}
      </div>
    </div>
  );
}
