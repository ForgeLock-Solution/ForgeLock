import React, { useRef } from 'react';
import { SERVICE_CATALOG, WHATSAPP_NUMBER, formatPrice, getWhatsAppUrl } from '../data/services';
import type { Service } from '../types.ts';

interface ServicesCatalogProps {
  selectedService: Service | null;
  onSelectService: (service: Service) => void;
  onOpenFiche: (service: Service) => void;
}

export const ServicesCatalog: React.FC<ServicesCatalogProps> = ({
  selectedService,
  onSelectService,
  onOpenFiche
}) => {
  const detailRef = useRef<HTMLDivElement>(null);

  const featured = SERVICE_CATALOG.filter((s) => s.group === 'featured');
  const digital = SERVICE_CATALOG.filter((s) => s.group === 'digital');

  const handleSelect = (service: Service) => {
    onSelectService(service);
    if (detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderCard = (service: Service) => {
    const isSelected = selectedService?.id === service.id;
    const whatsappHref = getWhatsAppUrl(service.message, WHATSAPP_NUMBER);

    return (
      <article
        key={service.id}
        className={`service-card flex h-full flex-col overflow-hidden rounded-2xl border transition-all ${
          isSelected
            ? 'border-brand-500 ring-2 ring-brand-500/30 bg-white shadow-md'
            : 'border-slate-200 bg-white shadow-xs hover:shadow-lg'
        }`}
      >
        <img
          className="aspect-[3/2] w-full object-cover"
          src={service.image}
          alt={service.imageAlt}
          width="1200"
          height="800"
          loading="lazy"
          decoding="async"
        />
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <i className={`${service.icon} text-2xl text-brand-700`} aria-hidden="true" />
          <h3 className="mt-4 text-xl font-bold text-slate-900">{service.name}</h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
            {service.description}
          </p>

          {service.cardNote && (
            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
              {service.cardNote}
            </p>
          )}

          <div className="mt-5 flex flex-col gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Consultar por WhatsApp sobre ${service.name}`}
              className="whatsapp-button inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-center text-sm font-bold text-slate-950 hover:bg-brand-600 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              <span>Consultar por WhatsApp</span>
              <i className="fa-brands fa-whatsapp text-lg" aria-hidden="true" />
            </a>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSelect(service)}
                className={`flex-1 min-h-11 items-center justify-center rounded-xl border px-3 py-2.5 text-center text-sm font-semibold transition-colors ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50 text-brand-800'
                    : 'border-slate-300 text-slate-800 hover:border-brand-600 hover:text-brand-700'
                }`}
              >
                Conocer {service.name}
              </button>

              <button
                type="button"
                onClick={() => onOpenFiche(service)}
                title="Ver ficha completa"
                className="px-3 min-h-11 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center text-sm"
              >
                <i className="fa-solid fa-file-lines" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  };

  return (
    <section id="servicios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto scroll-mt-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <span className="text-brand-700 text-xs uppercase tracking-widest font-bold">
            Servicios para tu negocio
          </span>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            Explora nuestros servicios
          </h2>
          <p className="mt-4 text-slate-600">
            Consulta cada opción y conoce la información disponible. Los detalles comerciales se confirman antes de comenzar.
          </p>
        </div>

        {/* Selected Service Detail Panel */}
        {selectedService && (
          <div
            ref={detailRef}
            id="detalle-servicio"
            className="mb-14 rounded-3xl border border-brand-500/40 bg-slate-50 p-6 sm:p-10 shadow-md scroll-mt-28"
          >
            <div className="flex flex-col lg:flex-row gap-8 items-start justify-between">
              <div className="space-y-4 max-w-3xl">
                <div className="flex items-center gap-3">
                  <span className="inline-flex px-3 py-1 rounded-full bg-brand-500/10 text-brand-700 text-xs font-bold border border-brand-500/30 uppercase tracking-wide">
                    {selectedService.name}
                  </span>
                  <span className="text-xs text-slate-500">Detalle del servicio</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {selectedService.detailTitle || selectedService.name}
                </h3>
                <p className="text-slate-700 text-base leading-relaxed">
                  {selectedService.description}
                </p>
                <div className="p-4 rounded-xl bg-white border border-slate-200 text-sm text-slate-700">
                  <span className="font-bold text-slate-900">Alcance y precio: </span>
                  {selectedService.pricing?.length ? (
                    <span>
                      Planes documentados: {selectedService.pricing.map((p) => `${p.name}: ${formatPrice(p.price)} (${p.delivery})`).join('; ')}.
                    </span>
                  ) : (
                    <span>{selectedService.pricingLabel}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
                <a
                  href={getWhatsAppUrl(selectedService.message, WHATSAPP_NUMBER)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-button w-full text-center"
                >
                  <i className="fa-brands fa-whatsapp text-lg" />
                  <span>
                    {selectedService.id === 'soluciones-personalizadas'
                      ? 'Cotiza según tu necesidad'
                      : 'Consultar por WhatsApp'}
                  </span>
                </a>
                <button
                  type="button"
                  onClick={() => onOpenFiche(selectedService)}
                  className="px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm transition-colors text-center"
                >
                  <i className="fa-solid fa-file-lines mr-2 text-brand-700" />
                  Ver ficha pública completa
                </button>
              </div>
            </div>

            {/* If Landing pages is selected, show the Landing Pricing table */}
            {selectedService.id === 'landing' && selectedService.pricing && (
              <div id="planes-landing" className="mt-10 pt-10 border-t border-slate-200">
                <div className="max-w-3xl mx-auto text-center mb-8">
                  <span className="text-brand-700 text-xs font-bold uppercase tracking-[.2em]">
                    Precios y alcance
                  </span>
                  <h4 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
                    Elige tu landing page
                  </h4>
                  <p className="mt-2 text-slate-600 text-sm">
                    Estos son los precios, tiempos y elementos incluidos en cada opción.
                  </p>
                </div>

                <div className="grid gap-7 lg:grid-cols-2">
                  {selectedService.pricing.map((plan, index) => {
                    const isFeatured = index === 1;
                    return (
                      <article
                        key={plan.name}
                        className={`rounded-2xl border ${
                          isFeatured
                            ? 'border-2 border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                            : 'border-slate-200'
                        } bg-white p-6 sm:p-8 flex flex-col justify-between`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <h5 className="text-2xl font-bold text-slate-900">{plan.name}</h5>
                            {isFeatured && (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                                Más popular
                              </span>
                            )}
                          </div>
                          <p className="mt-3 text-4xl font-black text-slate-900">
                            {formatPrice(plan.price)}
                          </p>
                          <p className="mt-2 text-slate-600 text-sm font-medium">
                            Entrega estimada de {plan.delivery}.
                          </p>

                          <h6 className="mt-6 font-bold text-slate-900 text-sm uppercase tracking-wider">
                            Incluye:
                          </h6>
                          <ul className="mt-3 space-y-2 text-sm text-slate-700">
                            {plan.features.map((feature, fIdx) => (
                              <li key={fIdx} className="flex items-start gap-2">
                                <i className="fa-solid fa-check text-brand-600 mt-1 shrink-0" />
                                <span>{feature}.</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <a
                          className="mt-8 whatsapp-button w-full"
                          href={getWhatsAppUrl(plan.message, WHATSAPP_NUMBER)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Consultar por WhatsApp sobre ${plan.name}`}
                        >
                          <i className="fa-brands fa-whatsapp text-lg" />
                          <span>Contratar {plan.name}</span>
                        </a>
                      </article>
                    );
                  })}
                </div>
                <p className="mt-5 text-center text-xs text-slate-500">
                  Los plazos se cuentan desde que ForgeLock recibe los materiales esenciales.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Catalog Categories */}
        <div className="space-y-14" aria-label="Catálogo de servicios ForgeLock">
          {/* Servicios principales */}
          <section aria-labelledby="servicios-principales-titulo">
            <div className="flex items-center justify-between mb-6">
              <h3 id="servicios-principales-titulo" className="text-2xl font-bold text-slate-900">
                Servicios principales
              </h3>
              <span className="text-xs font-semibold text-slate-500">6 soluciones</span>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {featured.map(renderCard)}
            </div>
          </section>

          {/* Presencia digital */}
          <section id="presencia-digital" aria-labelledby="servicios-digitales-titulo" className="scroll-mt-24">
            <div className="flex items-center justify-between mb-6">
              <h3 id="servicios-digitales-titulo" className="text-2xl font-bold text-slate-900">
                Presencia digital
              </h3>
              <span className="text-xs font-semibold text-slate-500">3 soluciones</span>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {digital.map(renderCard)}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
};
