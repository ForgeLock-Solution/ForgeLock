import React from 'react';
import { WHATSAPP_NUMBER, getWhatsAppUrl } from '../data/services';

interface HeroProps {
  onExploreServices: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreServices }) => {
  const whatsappHeroText = 'Hola, vi la página de ForgeLock y quiero información sobre sus landing pages, catálogos digitales o branding.';

  return (
    <div id="inicio" className="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden bg-white">
      {/* Decorative ambient blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-brand-700 text-sm font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            Landing pages y diseño digital para negocios
          </span>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Soluciones digitales para{' '}
            <span className="text-brand-700">presentar tu negocio con claridad</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Diseñamos landing pages y también puedes consultar por catálogos digitales y branding o diseño digital en Colombia.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={onExploreServices}
              className="px-8 py-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-center border border-slate-300 transition-colors shadow-xs"
            >
              Explorar servicios
            </button>
            <a
              href={getWhatsAppUrl(whatsappHeroText, WHATSAPP_NUMBER)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-center transition-all shadow-md flex items-center justify-center gap-2"
            >
              <i className="fa-brands fa-whatsapp text-xl"></i>
              <span>Hablar por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
