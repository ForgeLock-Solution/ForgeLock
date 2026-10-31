import React from 'react';
import { WORKFLOW_STEPS } from '../data/services';

export const Workflow: React.FC = () => {
  return (
    <section id="proceso" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-brand-700 text-xs uppercase tracking-widest font-bold">
            Paso a paso
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-4">
            ¿Cómo trabajamos contigo?
          </h2>
          <p className="mt-3 text-slate-600">
            Un proceso transparente y enfocado en resolver las necesidades reales de tu negocio.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {WORKFLOW_STEPS.map((item) => (
            <article
              key={item.step}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition-shadow"
            >
              <span className="inline-flex w-10 h-10 rounded-xl bg-brand-500 text-slate-950 font-black items-center justify-center text-base">
                {item.step}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-5">
                {item.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mt-3">
                {item.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
