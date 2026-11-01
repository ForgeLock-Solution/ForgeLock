import React from 'react';
import { WHATSAPP_NUMBER, getWhatsAppUrl } from '../data/services';
import { useDialogFocus } from '../hooks/useDialogFocus';

export type LegalDocType = 'aviso-legal' | 'politica-privacidad' | 'politica-cookies';

interface LegalModalProps {
  page: LegalDocType | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ page, onClose }) => {
  const dialogRef = useDialogFocus<HTMLDivElement>(Boolean(page), onClose);
  if (!page) return null;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-title"
      tabIndex={-1}
    >
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <img src="./resource/isotipo.png" alt="" width="28" height="28" className="w-7 h-7" />
            <span className="font-extrabold text-slate-900 text-sm">
              ForgeLock · Documento Legal
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Cerrar documento"
          >
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-10 max-h-[75vh] overflow-y-auto text-slate-700 text-sm leading-relaxed space-y-5">
          {page === 'aviso-legal' && (
            <div>
              <h1 id="legal-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
                Aviso legal
              </h1>
              <p className="text-xs text-slate-500 mb-6">Última actualización: 9 de octubre de 2026</p>
              
              <p>Este sitio web presenta los servicios y soluciones digitales ofrecidos bajo la marca <strong>ForgeLock</strong>.</p>
              
              <h2 className="text-lg font-bold text-slate-900 mt-6 mb-2">Identificación del titular</h2>
              <p>Titular persona natural: Diego Alexander Gaviria Jimenez. ForgeLock es la marca bajo la que ofrece servicios digitales en línea desde Colombia. El titular no declara un establecimiento físico de atención al público; las comunicaciones se reciben por medios electrónicos.</p>
              
              <h2 className="text-lg font-bold text-slate-900 mt-6 mb-2">Uso del sitio</h2>
              <p>El contenido de este sitio tiene finalidad informativa y comercial. Las características, precios, tiempos y alcances de un proyecto se confirman antes de iniciar cada servicio.</p>
              
              <h2 className="text-lg font-bold text-slate-900 mt-6 mb-2">Propiedad intelectual</h2>
              <p>Los textos, elementos gráficos, código, identidad visual y demás contenidos propios de ForgeLock están protegidos por la normativa aplicable. No se autoriza su reproducción o reutilización comercial sin permiso.</p>
              
              <h2 className="text-lg font-bold text-slate-900 mt-6 mb-2">Contacto</h2>
              <p>
                Para solicitudes relacionadas con este aviso legal, puedes contactar al titular por{' '}
                <a href="mailto:forge.look19@gmail.com" className="text-emerald-700 underline font-semibold">forge.look19@gmail.com</a> o mediante{' '}
                <a href={getWhatsAppUrl('Hola, tengo una consulta sobre el aviso legal.', WHATSAPP_NUMBER)} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline font-semibold">WhatsApp al 304 340 2589</a>.
              </p>
            </div>
          )}

          {page === 'politica-privacidad' && (
            <div>
              <h1 id="legal-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
                Política de privacidad
              </h1>
              <p className="text-xs text-slate-500 mb-6">Última actualización: 9 de octubre de 2026</p>
              
              <p>El responsable del tratamiento es Diego Alexander Gaviria Jimenez, persona natural que opera bajo la marca ForgeLock en Colombia. ForgeLock presta servicios digitales en línea y no declara un establecimiento físico de atención al público. Esta política cubre los datos personales de clientes y de personas que contactan para solicitar o gestionar servicios.</p>
              
              <h2 className="text-lg font-bold text-slate-900 mt-6 mb-2">Datos que pueden tratarse</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Datos de identificación y contacto que el cliente facilita, como nombre, correo, teléfono y datos necesarios para gestionar el proyecto.</li>
                <li>Información comercial y técnica necesaria para cotizar, contratar, desarrollar y dar soporte a los servicios.</li>
                <li>Mensajes y archivos que el cliente decida compartir por correo o WhatsApp.</li>
                <li>Datos técnicos y de navegación generados por analítica, sujetos a la configuración y al consentimiento aplicable.</li>
              </ul>
              <p className="mt-2">No se deben enviar datos sensibles ni información de terceros que no sea necesaria para el servicio.</p>

              <h2 className="text-lg font-bold text-slate-900 mt-6 mb-2">Finalidades</h2>
              <p>Los datos se utilizan para responder solicitudes, preparar y gestionar cotizaciones, formalizar y ejecutar servicios, mantener comunicación con clientes, atender soporte, cumplir obligaciones legales o contractuales, proteger la seguridad del proyecto y, cuando exista una base válida y el consentimiento requerido, medir el uso del sitio mediante analítica.</p>

              <h2 className="text-lg font-bold text-slate-900 mt-6 mb-2">WhatsApp</h2>
              <p>Cuando una persona utiliza un enlace de WhatsApp, la conversación continúa en la plataforma de WhatsApp y queda sujeta también a sus propias condiciones y políticas.</p>

              <h2 className="text-lg font-bold text-slate-900 mt-6 mb-2">Derechos de los titulares</h2>
              <p>Las personas pueden solicitar acceso a sus datos, conocer su tratamiento, pedir actualización o rectificación, solicitar supresión cuando proceda y revocar la autorización cuando sea legalmente viable.</p>

              <h2 className="text-lg font-bold text-slate-900 mt-6 mb-2">Canales y procedimiento de solicitudes</h2>
              <p>
                Envía tu solicitud al correo <a href="mailto:forge.look19@gmail.com" className="text-emerald-700 underline font-semibold">forge.look19@gmail.com</a> o al{' '}
                <a href={getWhatsAppUrl('Hola ForgeLock, quiero solicitar información sobre privacidad o protección de datos.', WHATSAPP_NUMBER)} target="_blank" rel="noopener noreferrer" className="text-emerald-700 underline font-semibold">WhatsApp 304 340 2589</a>.
              </p>
            </div>
          )}

          {page === 'politica-cookies' && (
            <div>
              <h1 id="legal-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
                Política de cookies
              </h1>
              <p className="text-xs text-slate-500 mb-6">Última actualización: 9 de octubre de 2026</p>

              <p>Las cookies y tecnologías similares pueden utilizarse para recordar preferencias y, cuando se autorice, medir el uso del sitio.</p>

              <h2 className="text-lg font-bold text-slate-900 mt-6 mb-2">Cookies necesarias</h2>
              <p>El sitio puede utilizar almacenamiento local del navegador para recordar la decisión del visitante respecto al consentimiento de analítica. Esta preferencia no contiene contraseñas ni datos sensibles.</p>

              <h2 className="text-lg font-bold text-slate-900 mt-6 mb-2">Analítica</h2>
              <p>ForgeLock puede utilizar analítica para conocer visitas e interacciones. Las herramientas no se cargan para el visitante hasta que este acepte la analítica mediante el banner correspondiente.</p>

              <h2 className="text-lg font-bold text-slate-900 mt-6 mb-2">Gestión de preferencias</h2>
              <p>El visitante puede aceptar o rechazar la analítica en cualquier momento desde el botón de «Preferencias de cookies» al pie de página.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
