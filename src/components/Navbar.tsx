import React, { useState } from 'react';
import { NAV_LINKS, WHATSAPP_NUMBER, getWhatsAppUrl } from '../data/services';

interface NavbarProps {
  onSelectService?: (id: string | null) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSelectService }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const whatsappNavText = 'Hola, quiero información sobre landing pages, catálogos digitales o branding de ForgeLock.';

  const handleLinkClick = (href: string) => {
    setIsMenuOpen(false);
    if (onSelectService) {
      onSelectService(null);
    }
    const targetElement = document.querySelector(href);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <a
          href="#inicio"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('#inicio');
          }}
          className="flex items-center gap-3 group"
          aria-label="ForgeLock, inicio"
        >
          <img
            src="./resource/isotipo.png"
            alt="Isotipo ForgeLock"
            width="40"
            height="40"
            className="w-10 h-10 object-contain group-hover:scale-105 transition-transform"
          />
          <div>
            <span className="text-xl font-bold text-slate-900">
              Forge<span className="text-brand-700">Lock</span>
            </span>
            <span className="block text-[10px] text-slate-500 tracking-wider uppercase font-semibold">
              Tecnología & Negocios
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(link.href);
              }}
              className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href={getWhatsAppUrl(whatsappNavText, WHATSAPP_NUMBER)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-semibold text-sm transition-all shadow-sm"
          >
            <i className="fa-brands fa-whatsapp text-lg"></i>
            <span>Hablar por WhatsApp</span>
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-slate-700 hover:text-slate-900 p-2 text-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg"
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-controls="mobile-menu"
          aria-expanded={isMenuOpen}
        >
          <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3" id="mobile-menu">
          {NAV_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                handleLinkClick(link.href);
              }}
              className="block py-2.5 px-4 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              {link.name}
            </a>
          ))}
          <a
            href={getWhatsAppUrl('Hola, me comunico desde ForgeLock.', WHATSAPP_NUMBER)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-500 text-slate-950 font-semibold shadow-sm"
          >
            <i className="fa-brands fa-whatsapp text-lg"></i>
            <span>Hablar por WhatsApp</span>
          </a>
        </div>
      )}
    </header>
  );
};
