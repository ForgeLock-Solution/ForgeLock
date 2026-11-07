import React from 'react';
import { NAV_LINKS, SOCIAL_LINKS, WHATSAPP_NUMBER, getWhatsAppUrl } from '../data/services';

interface FooterProps {
  onOpenCookieSettings: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenCookieSettings }) => {
  const whatsappFooterText = 'Hola, quiero información sobre landing pages, catálogos digitales o branding de ForgeLock.';

  const handleLinkClick = (href: string) => {
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="footer-container" className="bg-slate-50 border-t border-slate-200 text-slate-600 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 pb-10 border-b border-slate-200">
          {/* Brand Col */}
          <div>
            <div className="flex items-center gap-3">
              <img src="./resource/isotipo.png" alt="" width="32" height="32" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold text-slate-900">
                Forge<span className="text-brand-700">Lock</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-4 leading-relaxed max-w-xs">
              Landing pages, catálogos digitales y branding para negocios y emprendedores en Colombia.
            </p>
          </div>

          {/* Nav Links Col */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Enlaces
            </h4>
            <div className="flex flex-col gap-2 mt-3 text-sm">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(link.href);
                  }}
                  className="hover:text-brand-700 transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Contact Col */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Contacto directo
            </h4>
            <div className="flex flex-col gap-3 mt-3 text-sm">
              <a
                href={getWhatsAppUrl(whatsappFooterText, WHATSAPP_NUMBER)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactar a ForgeLock por WhatsApp"
                className="flex items-center gap-2 hover:text-brand-700 transition-colors"
              >
                <i className="fa-brands fa-whatsapp text-brand-600 text-base w-5 text-center" />
                <span className="font-medium">304 340 2589</span>
              </a>

              <a
                href={getWhatsAppUrl('Hola ForgeLock, quiero solicitar información sobre privacidad o protección de datos.', WHATSAPP_NUMBER)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Consultar a ForgeLock sobre privacidad por WhatsApp"
                className="flex items-center gap-2 hover:text-brand-700 transition-colors"
              >
                <i className="fa-solid fa-shield-halved text-brand-600 text-base w-5 text-center" />
                <span>Privacidad y datos</span>
              </a>

              <div className="flex items-center gap-2 pt-1">
                <i className="fa-solid fa-share-nodes text-brand-600 text-base w-5 text-center" aria-hidden="true" />
                <span className="whitespace-nowrap text-xs text-slate-500">Síguenos en:</span>
                <div className="flex items-center gap-3 ml-2">
                  {SOCIAL_LINKS.map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.name}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 text-brand-600 hover:text-brand-700 hover:border-brand-500 transition-colors shadow-2xs"
                    >
                      <i className={s.icon} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Cookie links */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a
              href="./aviso-legal.html"
              className="hover:text-brand-700 underline text-slate-600 cursor-pointer"
            >
              Aviso legal
            </a>
            <a
              href="./politica-privacidad.html"
              className="hover:text-brand-700 underline text-slate-600 cursor-pointer"
            >
              Privacidad
            </a>
            <a
              href="./politica-cookies.html"
              className="hover:text-brand-700 underline text-slate-600 cursor-pointer"
            >
              Cookies
            </a>
            <button
              type="button"
              onClick={onOpenCookieSettings}
              className="text-slate-700 hover:text-brand-700 underline cursor-pointer"
            >
              Preferencias de cookies
            </button>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} ForgeLock. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
