import React from 'react';
import { WHATSAPP_NUMBER, getWhatsAppUrl } from '../data/services';

interface HelpAndCtaProps {
  onTellIdea: () => void;
}

export const HelpAndCta: React.FC<HelpAndCtaProps> = ({ onTellIdea }) => {
  const whatsappCtaText = 'Hola, quiero información sobre los servicios de ForgeLock.';

  return (
    <div>
      {/* Help Banner */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xs">
            <div className="max-w-2xl">
              <span className="text-brand-700 text-sm font-bold uppercase tracking-wider">
                ¿Dudas sobre qué elegir?
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
                ¿Qué quieres presentar en internet?
              </h3>
              <p className="text-slate-600 mt-3 text-base leading-relaxed">
                Cuéntanos si buscas una landing page, un catálogo digital o branding para tu negocio. Te asesoramos sin compromiso.
              </p>
            </div>
            <button
              type="button"
              onClick={onTellIdea}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold whitespace-nowrap transition-all shadow-md cursor-pointer"
            >
              <i className="fa-brands fa-whatsapp text-xl" />
              <span>Contar mi idea</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main CTA Section */}
      <section id="contacto" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <span className="text-brand-700 font-bold uppercase tracking-widest text-xs">
            Iniciemos hoy mismo
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Presenta tu negocio con una landing page.
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Consulta por landing pages, catálogos digitales o branding. Desarrollamos soluciones claras y adaptadas a tu presupuesto.
          </p>
          <div className="pt-2">
            <a
              href={getWhatsAppUrl(whatsappCtaText, WHATSAPP_NUMBER)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <i className="fa-brands fa-whatsapp text-2xl" />
              <span>Hablar por WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* Structured Informational & FAQ section */}
      <section id="informacion-forgelock" className="py-16 bg-white border-t border-slate-200" aria-labelledby="informacion-forgelock-titulo">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-6 text-slate-600 leading-relaxed">
            <div className="flex justify-center mb-4">
              <img
                src="./resource/isotipo.png"
                alt="Símbolo de ForgeLock, marca de soluciones digitales"
                width="64"
                height="64"
                loading="lazy"
                decoding="async"
              />
            </div>
            <h2 id="informacion-forgelock-titulo" className="text-2xl sm:text-3xl font-bold text-slate-900 text-center">
              Landing pages para emprendedores y pequeños negocios
            </h2>
            <p>
              ForgeLock diseña landing pages para presentar negocios, servicios o productos, con información y canales de contacto directos. También ofrece catálogos digitales y branding o diseño digital.
            </p>

            <div className="space-y-4 pt-2">
              <h3 className="text-xl font-bold text-slate-900">Landing pages</h3>
              <p>
                Una página web permite reunir en un solo lugar la información de tu negocio, tus servicios, preguntas frecuentes y canales de contacto. Una landing page puede enfocarse en un servicio o una oferta concreta, con una estructura clara y adaptable a celulares y computadores.
              </p>

              <h3 className="text-xl font-bold text-slate-900">Catálogos digitales y branding</h3>
              <p>
                Los catálogos digitales organizan productos o servicios para que las personas puedan consultarlos fácilmente. El branding y la identidad visual ayudan a mantener una presentación coherente en los canales digitales y materiales de comunicación de tu negocio.
              </p>

              <h3 className="text-xl font-bold text-slate-900">Un proceso claro, desde la idea hasta la entrega</h3>
              <p>
                Primero conversamos sobre las necesidades y objetivos de tu negocio; después definimos el alcance de la solución, desarrollamos la propuesta y revisamos los ajustes acordados antes de la entrega. El alcance, el precio y el plazo se confirman en la cotización de cada proyecto.
              </p>
            </div>

            {/* FAQ Accordion / List */}
            <div className="pt-6 border-t border-slate-200 space-y-4">
              <h3 className="text-xl font-bold text-slate-900">Preguntas frecuentes</h3>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 text-sm">¿Qué solución necesita mi negocio?</p>
                <p className="text-sm text-slate-600 mt-1">
                  Depende de tu objetivo: una página web presenta tu negocio y sus servicios; una landing page concentra la atención en una oferta; y un catálogo digital facilita consultar productos o servicios.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 text-sm">¿La página puede incluir WhatsApp?</p>
                <p className="text-sm text-slate-600 mt-1">
                  Sí, podemos integrar enlaces de contacto directo por WhatsApp y botones de llamada a la acción en toda tu landing page.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900 text-sm">¿Cómo se define el precio?</p>
                <p className="text-sm text-slate-600 mt-1">
                  Revisamos los objetivos, el contenido y las funciones necesarias antes de confirmar el alcance y la cotización. No se inicia el desarrollo sin acordar previamente esos puntos.
                </p>
              </div>
            </div>

            <div className="pt-4 text-center">
              <a
                href={getWhatsAppUrl('Hola, quiero consultar por una solución digital para mi negocio.', WHATSAPP_NUMBER)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold shadow-sm"
              >
                <i className="fa-brands fa-whatsapp text-lg" />
                <span>Solicitar información por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
