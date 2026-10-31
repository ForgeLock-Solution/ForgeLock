import React from 'react';
import type { Service } from '../types.ts';
import { SERVICE_BY_ID, WHATSAPP_NUMBER, getWhatsAppUrl } from '../data/services';

interface ServiceFicheModalProps {
  service: Service | null;
  onClose: () => void;
  onSelectService: (service: Service) => void;
}

export const ServiceFicheModal: React.FC<ServiceFicheModalProps> = ({
  service,
  onClose,
  onSelectService
}) => {
  if (!service) return null;

  const whatsappText = `Hola, quiero información sobre ${service.name} para mi negocio.`;
  const whatsappUrl = getWhatsAppUrl(whatsappText, WHATSAPP_NUMBER);

  const relatedServices = service.relatedIds
    .map((id) => SERVICE_BY_ID[id])
    .filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-fiche-title"
    >
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <img src="./resource/isotipo.png" alt="" width="32" height="32" className="w-8 h-8" />
            <span className="font-extrabold text-slate-900 text-base">
              Forge<span className="text-brand-700">Lock</span> · Ficha Oficial
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Cerrar ficha"
          >
            <i className="fa-solid fa-xmark text-xl" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 sm:p-10 max-h-[80vh] overflow-y-auto">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {/* Visual Figure */}
            <figure className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm lg:col-start-2 lg:row-start-1">
              <img
                className="aspect-[3/2] w-full rounded-2xl object-cover shadow-xs"
                src={service.image}
                alt={service.imageAlt}
                width="1200"
                height="800"
              />
              <figcaption className="mt-3 text-center text-xs text-slate-500 font-medium">
                {service.name}
              </figcaption>
            </figure>

            {/* Article */}
            <article className="lg:col-start-1 lg:row-start-1 space-y-6">
              <div>
                <span className="font-bold uppercase tracking-widest text-emerald-800 text-xs">
                  Servicio ForgeLock
                </span>
                <h2 id="modal-fiche-title" className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl leading-tight">
                  {service.name}
                </h2>
              </div>

              <p className="text-base text-slate-700 leading-relaxed">
                {service.ficheLongDescription || service.description}
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Precio y alcance
                </h3>
                <p className="mt-1 text-slate-700 text-sm font-medium">
                  {service.pricingLabel}
                </p>
              </div>

              <div>
                <a
                  className="whatsapp-button w-full sm:w-auto inline-flex"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Consultar por WhatsApp sobre ${service.name}`}
                >
                  <i className="fa-brands fa-whatsapp text-lg" />
                  <span>Consultar por WhatsApp</span>
                </a>
              </div>

              {relatedServices.length > 0 && (
                <div className="pt-4 border-t border-slate-200">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                    Servicios relacionados
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {relatedServices.map((rel) => (
                      <button
                        key={rel.id}
                        type="button"
                        onClick={() => onSelectService(rel)}
                        className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
                      >
                        {rel.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </article>
          </div>
        </div>

        {/* Modal footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
          <span className="text-xs text-slate-500">ForgeLock · Tecnología & Negocios</span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline"
          >
            Cerrar ficha
          </button>
        </div>
      </div>
    </div>
  );
};
