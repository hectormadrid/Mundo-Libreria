import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    title: (
      <>
        Bienvenido a <span className="text-lib-yellow">Mundo Librería</span>
      </>
    ),
    text: 'Donde cada página es una nueva aventura',
    cta: 'Explorar ahora ✨',
    className: 'from-lib-blue via-blue-600 to-blue-800',
  },
  {
    title: (
      <>
        Ofertas <span className="text-lib-yellow">Increíbles</span>
      </>
    ),
    text: 'Hasta 50% de descuento en libros seleccionados',
    cta: 'Ver ofertas 🔥',
    className: 'from-lib-red via-red-600 to-red-800',
  },
  {
    title: (
      <>
        Nueva <span className="text-lib-blue">Colección</span>
      </>
    ),
    text: 'Descubre los lanzamientos más esperados',
    cta: 'Descubrir 🚀',
    className: 'from-yellow-400 via-lib-yellow to-yellow-500 text-gray-900',
  },
];

export function Carousel({ onCta }: { onCta: () => void }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, [paused]);

  const go = (delta: number) => setIndex((i) => (i + delta + SLIDES.length) % SLIDES.length);

  return (
    <section
      className="relative h-64 overflow-hidden sm:h-80"
      aria-roledescription="carrusel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex h-full transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${index * 100}%)` }}>
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            className={`relative flex h-full w-full shrink-0 items-center justify-center bg-gradient-to-br text-white ${slide.className}`}
            aria-hidden={i !== index}
          >
            <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden="true">
              <div className="absolute top-8 left-8 h-20 w-20 animate-float rounded-full bg-white/40" />
              <div className="absolute right-12 bottom-8 h-28 w-28 animate-float rounded-full bg-white/30 [animation-delay:2s]" />
            </div>
            <div className="relative z-10 px-6 text-center">
              <h2 className="mb-3 text-3xl font-bold sm:text-5xl">{slide.title}</h2>
              <p className="mb-6 text-lg opacity-90 sm:text-xl">{slide.text}</p>
              <button
                type="button"
                onClick={onCta}
                tabIndex={i === index ? 0 : -1}
                className="rounded-full bg-white px-8 py-3 font-bold text-gray-800 shadow-lg transition hover:scale-105"
              >
                {slide.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => go(-1)}
        className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/30 p-2 text-white backdrop-blur transition hover:bg-white/50"
        aria-label="Anterior"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/30 p-2 text-white backdrop-blur transition hover:bg-white/50"
        aria-label="Siguiente"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className={`h-3 rounded-full transition-all ${i === index ? 'w-8 bg-white' : 'w-3 bg-white/50'}`}
            aria-label={`Ir a la diapositiva ${i + 1}`}
            aria-current={i === index}
          />
        ))}
      </div>
    </section>
  );
}
