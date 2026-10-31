import React, { useState, useRef, useEffect } from 'react';
import { AIService } from '../services/aiService';
import type { IdeaProposal } from '../types.ts';
import { WHATSAPP_NUMBER } from '../data/services';

export const NeedFinder: React.FC = () => {
  const [input, setInput] = useState('');
  const [proposal, setProposal] = useState<IdeaProposal | null>(null);
  const [isDraft, setIsDraft] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Live heuristic analysis while typing (if >= 10 chars and not yet manually generated)
  useEffect(() => {
    const trimmed = input.trim();
    if (trimmed.length >= 10 && !proposal) {
      const draft = AIService.heuristicAnalysis(trimmed);
      setProposal(draft);
      setIsDraft(true);
    } else if (trimmed.length < 10 && isDraft) {
      setProposal(null);
      setIsDraft(false);
    }
  }, [input, proposal, isDraft]);

  const handleGenerate = async () => {
    const trimmed = input.trim();
    setError(null);

    if (!trimmed) {
      setError('Por favor escribe tu idea antes de generar la propuesta.');
      textareaRef.current?.focus();
      return;
    }
    if (trimmed.length < 10) {
      setError('Cuéntanos un poco más sobre tu negocio para poder ayudarte mejor (al menos 10 caracteres).');
      textareaRef.current?.focus();
      return;
    }

    try {
      setIsLoading(true);
      const result = await AIService.analyzeIdea(trimmed);
      setProposal(result);
      setIsDraft(false);
    } catch (err) {
      console.error('Error generando propuesta:', err);
      setError('No pudimos generar la propuesta en este momento. Puedes intentarlo nuevamente o contactar directamente por WhatsApp.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setInput('');
    setProposal(null);
    setIsDraft(false);
    setError(null);
    textareaRef.current?.focus();
  };

  const handleEdit = () => {
    textareaRef.current?.focus();
  };

  const whatsappHref = proposal
    ? AIService.getWhatsAppLink(input, proposal, WHATSAPP_NUMBER)
    : '#';

  return (
    <section id="necesidad" className="py-20 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="idea-generator-panel rounded-3xl bg-slate-900 border border-brand-500/20 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute -right-24 -top-24 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl mx-auto text-center mb-10 relative">
            <span className="text-brand-400 text-sm font-semibold tracking-wide uppercase">
              Brief digital para empezar
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
              Cuéntanos cómo imaginas tu página
            </h2>
            <p className="mt-3 text-slate-300 text-base sm:text-lg">
              Describe tu idea con tus propias palabras. Nosotros te ayudamos a convertirla en una propuesta digital estructurada.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
            {/* Input column */}
            <div className="lg:col-span-6 flex flex-col space-y-5">
              <div>
                <label htmlFor="idea-textarea" className="block text-sm font-semibold text-slate-200 mb-2">
                  Tu descripción libre
                </label>
                <textarea
                  id="idea-textarea"
                  ref={textareaRef}
                  rows={7}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full rounded-2xl bg-slate-950/80 border border-slate-700 p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none text-sm sm:text-base"
                  placeholder="Cuéntanos qué negocio tienes, qué quieres mostrar, qué estilo te gusta y qué debería poder hacer tu página…"
                />
                <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
                  <span>La propuesta es orientativa. Los detalles finales se definen contigo.</span>
                  <span>{input.length} caracteres</span>
                </div>
              </div>

              {error && (
                <div
                  className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-center gap-2"
                  role="alert"
                >
                  <i className="fa-solid fa-triangle-exclamation text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  id="btn-generate"
                  type="button"
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-slate-950 font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-wand-magic-sparkles" />
                  <span>✨ Generar mi idea</span>
                </button>
                <button
                  id="btn-reset"
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-3.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-700 transition-all border border-slate-700 cursor-pointer"
                >
                  Limpiar
                </button>
              </div>
            </div>

            {/* Proposal Preview Column */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-6 shadow-xl relative min-h-[420px] flex flex-col justify-between">
                {isLoading && (
                  <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-2xl z-20 flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
                    <p className="text-brand-400 font-medium text-sm animate-pulse">
                      Estamos organizando tu idea…
                    </p>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-4">
                    <span className="text-xs font-semibold tracking-wider uppercase text-brand-400 flex items-center gap-2">
                      <i className="fa-solid fa-file-contract" />
                      <span>Vista previa de propuesta</span>
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        !proposal
                          ? 'bg-slate-800 text-slate-400 border-slate-700'
                          : isDraft
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          : 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                      }`}
                    >
                      {!proposal ? 'Esperando idea' : isDraft ? 'Borrador en vivo' : 'Propuesta lista'}
                    </span>
                  </div>

                  {!proposal ? (
                    <div className="text-center py-16 text-slate-400 space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mx-auto text-slate-500 text-2xl">
                        <i className="fa-solid fa-compass-drafting" />
                      </div>
                      <p className="text-base font-medium text-slate-300">Tu idea aparecerá aquí</p>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto">
                        Escribe en el cuadro para transformar tu visión en una propuesta estructurada por ForgeLock.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 text-sm">
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <i className="fa-solid fa-store text-brand-400 text-sm" />
                          <span>{proposal.businessName}</span>
                        </h3>
                        <p className="text-xs text-brand-400 font-medium mt-1">
                          {proposal.sector}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                          <span className="text-xs text-slate-400 block font-medium">Objetivo</span>
                          <span className="text-slate-200 text-xs">{proposal.objective}</span>
                        </div>
                        <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                          <span className="text-xs text-slate-400 block font-medium">Estilo visual</span>
                          <span className="text-slate-200 text-xs">{proposal.visualStyle}</span>
                        </div>
                      </div>

                      <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                        <span className="text-xs text-slate-400 block font-medium">Colores sugeridos</span>
                        <span className="text-slate-200 text-xs">{proposal.colorsSuggested}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                          <span className="text-xs text-brand-400 font-semibold block mb-2">
                            Secciones recomendadas
                          </span>
                          <ul className="text-xs text-slate-300 space-y-1">
                            {proposal.pageStructure.map((sec, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="text-brand-500">•</span>
                                <span>{sec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                          <span className="text-xs text-brand-400 font-semibold block mb-2">
                            Funcionalidades
                          </span>
                          <ul className="text-xs text-slate-300 space-y-1">
                            {proposal.functionalities.map((func, i) => (
                              <li key={i} className="flex gap-2">
                                <span className="text-brand-500">•</span>
                                <span>{func}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="text-xs text-slate-300 bg-brand-500/5 border border-brand-500/10 p-3 rounded-xl">
                        <span className="font-semibold text-brand-400">Llamado a la acción: </span>
                        {proposal.callToAction}
                        <br />
                        <span className="font-semibold text-brand-400">Por definir: </span>
                        {proposal.pendingInfo}
                      </div>
                    </div>
                  )}
                </div>

                {proposal && (
                  <div className="pt-6 mt-6 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2 text-center"
                    >
                      <i className="fa-brands fa-whatsapp text-lg" />
                      <span>💬 Quiero esta idea</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <i className="fa-solid fa-pen" />
                      <span>Editar mi idea</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
