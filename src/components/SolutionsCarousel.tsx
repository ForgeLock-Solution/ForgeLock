import React, { useState } from 'react';
import { SERVICE_CATALOG, WHATSAPP_NUMBER, getWhatsAppUrl } from '../data/services';
import type { Service } from '../types.ts';

interface SolutionsCarouselProps {
  onSelectService: (service: Service) => void;
}

const badgeClasses: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/30',
  blue: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
  purple: 'bg-purple-500/10 text-purple-700 border-purple-500/30',
  amber: 'bg-amber-500/10 text-amber-700 border-amber-500/30'
};

export const SolutionsCarousel: React.FC<SolutionsCarouselProps> = ({ onSelectService }) => {
  const featured = SERVICE_CATALOG.filter((s) => s.homepageFeature);
  const [activeIndex, setActiveIndex] = useState(0);

  const active = featured[activeIndex] || featured[0];
  const feature = active.homepageFeature!;

  return (
    <section id="soluciones" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="text-brand-700 text-xs uppercase tracking-widest font-bold">
            Soluciones ForgeLock
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Soluciones digitales para el día a día de tu negocio
          </h2>
        </div>

        {/* Tab buttons */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-8"
          role="group"
          aria-label="Soluciones destacadas"
        >
          {featured.map((solution, index) => {
            const isCurrent = index === activeIndex;
            return (
              <button
                key={solution.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-pressed={isCurrent}
                aria-controls="solution-panel"
                className={`solution-card-transition p-4 rounded-2xl text-left border transition-all ${
                  isCurrent
                    ? 'bg-white border-brand-500 shadow-md ring-1 ring-brand-500/50'
                    : 'bg-slate-100 border-slate-200 hover:border-slate-300 hover:bg-white text-slate-700'
                }`}
              >
                <i className={`${solution.icon} text-brand-700 text-2xl mb-1`} aria-hidden="true" />
                <span className="block mt-3 text-sm font-bold text-slate-900">
                  {solution.homepageFeature?.title}
                </span>
                <span className="block mt-1 text-xs text-slate-500">
                  {solution.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active solution panel */}
        <div
          id="solution-panel"
          aria-live="polite"
          className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg"
        >
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className={`inline-flex px-3.5 py-1 rounded-full ${badgeClasses[feature.tone]} border text-xs font-bold uppercase tracking-wider`}>
                {feature.tag}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {feature.title}
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed">
                {active.heroText}
              </p>

              {feature.highlights && feature.highlights.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-3 pt-1">
                  {feature.highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="text-sm font-medium text-slate-700 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 flex items-center gap-2"
                    >
                      <i className="fa-solid fa-check text-brand-600 shrink-0" aria-hidden="true" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                <a
                  href={getWhatsAppUrl(active.message, WHATSAPP_NUMBER)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold transition-all shadow-sm"
                >
                  <i className="fa-brands fa-whatsapp text-lg" aria-hidden="true" />
                  <span>Quiero esta solución</span>
                </a>
                <button
                  type="button"
                  onClick={() => onSelectService(active)}
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-slate-300 text-slate-900 font-semibold hover:border-slate-400 hover:bg-slate-50 transition-colors underline decoration-brand-500 underline-offset-4"
                >
                  Conocer {active.name}
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-50 p-8 rounded-2xl border border-slate-200 min-h-[240px] flex flex-col justify-center items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-xs mb-4">
                <i className={`${active.icon} text-brand-700 text-4xl`} aria-hidden="true" />
              </div>
              <h4 className="text-slate-900 font-bold text-lg">¿Te interesa {active.name}?</h4>
              <p className="text-sm text-slate-600 mt-2 max-w-xs">
                Conversemos directamente por WhatsApp para coordinar los detalles.
              </p>
              <a
                href={getWhatsAppUrl(`Hola, tengo dudas sobre ${active.name} y me gustaría una orientación personalizada.`, WHATSAPP_NUMBER)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1.5 underline underline-offset-4"
              >
                <span>Preguntar dudas directas</span>
                <i className="fa-solid fa-arrow-right text-[10px]" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
