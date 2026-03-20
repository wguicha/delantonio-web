import { useState } from 'react';
import { galleryPhotos, type GalleryCategory } from '../../data/galleryData';

const TABS: { label: string; value: GalleryCategory | 'todo' }[] = [
  { label: 'Todo', value: 'todo' },
  { label: 'Comida', value: 'comida' },
  { label: 'Amigos', value: 'amigos' },
];

export function GallerySection() {
  const [active, setActive] = useState<GalleryCategory | 'todo'>('todo');
  const [lightbox, setLightbox] = useState<string | null>(null);

  const filtered = active === 'todo'
    ? galleryPhotos
    : galleryPhotos.filter((p) => p.category === active);

  return (
    <section id="galeria" className="py-20 px-4" aria-label="Galería">
      <div className="max-w-6xl mx-auto">

        {/* Title */}
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl text-rock-white mb-4"
            style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.05em' }}
          >
            GALERÍA
          </h2>
          <div className="w-16 h-0.5 bg-rock-red mx-auto" />
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActive(tab.value)}
              className={`px-5 py-2 text-sm uppercase tracking-widest transition-colors ${
                active === tab.value
                  ? 'bg-rock-red text-white'
                  : 'bg-rock-card text-rock-metal-light hover:text-rock-white border border-rock-border'
              }`}
              style={{
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                letterSpacing: '0.15em',
                clipPath: 'polygon(4px 0%, 100% 0%, calc(100% - 4px) 100%, 0% 100%)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <p className="text-center text-rock-metal-light text-sm">Próximamente...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((photo, i) => (
              <button
                key={i}
                className="group relative aspect-square overflow-hidden bg-rock-card border border-rock-border focus:outline-none focus:ring-2 focus:ring-rock-red"
                onClick={() => setLightbox(photo.src)}
                aria-label={`Ver foto: ${photo.alt}`}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Foto ampliada"
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl leading-none hover:text-rock-red transition-colors"
            onClick={() => setLightbox(null)}
            aria-label="Cerrar"
          >
            ✕
          </button>
          <img
            src={lightbox}
            alt="Foto ampliada"
            className="max-w-full max-h-full object-contain rounded"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
