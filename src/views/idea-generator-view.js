const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

const listMarkup = (items) => items.map((item) => `<li class="flex gap-2"><span class="text-brand-500">•</span><span>${escapeHtml(item)}</span></li>`).join('');

export const IdeaGeneratorView = {
    render(containerElement) {
        if (!containerElement) return;
        containerElement.innerHTML = `<div class="idea-generator-panel rounded-3xl bg-slate-900 border border-brand-500/20 p-6 sm:p-10 shadow-2xl relative overflow-hidden"><div class="absolute -right-24 -top-24 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div><div class="max-w-3xl mx-auto text-center mb-10 relative"><span class="text-brand-400 text-sm font-semibold">Brief digital para empezar</span><h2 class="text-3xl sm:text-4xl font-extrabold text-white mt-3">Cuéntanos cómo imaginas tu página</h2><p class="mt-3 text-slate-400 text-base sm:text-lg">Describe tu idea con tus propias palabras. Nosotros te ayudamos a convertirla en una propuesta digital.</p></div><div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative"><div class="lg:col-span-6 flex flex-col space-y-5"><div><label for="idea-textarea" class="block text-sm font-semibold text-slate-200 mb-2">Tu descripción libre</label><textarea id="idea-textarea" rows="7" class="w-full rounded-2xl bg-slate-950/80 border border-slate-700 p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all resize-none text-sm sm:text-base" placeholder="Cuéntanos qué negocio tienes, qué quieres mostrar, qué estilo te gusta y qué debería poder hacer tu página…"></textarea><p class="mt-2 text-xs text-slate-500">La propuesta es orientativa. Los detalles finales se definen contigo.</p></div><div id="form-error-msg" class="hidden text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-center gap-2" role="alert"><i class="fa-solid fa-triangle-exclamation"></i><span id="error-text"></span></div><div class="flex flex-col sm:flex-row gap-3 pt-2"><button id="btn-generate" type="button" class="flex-1 px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"><i class="fa-solid fa-wand-magic-sparkles"></i><span>✨ Generar mi idea</span></button><button id="btn-reset" type="button" class="px-5 py-3.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-700 transition-all border border-slate-700">Limpiar</button></div></div><div class="lg:col-span-6"><div class="rounded-2xl bg-slate-950/60 border border-slate-800 p-6 shadow-xl relative min-h-[420px] flex flex-col justify-between"><div id="preview-loading" class="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-2xl z-20 flex flex-col items-center justify-center gap-3 hidden"><div class="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div><p id="loading-text" class="text-brand-400 font-medium text-sm animate-pulse">Estamos organizando tu idea…</p></div><div><div class="flex items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-4"><span class="text-xs font-semibold tracking-wider uppercase text-brand-400 flex items-center gap-2"><i class="fa-solid fa-file-contract"></i><span>Vista previa de propuesta</span></span><span id="badge-status" class="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">Esperando idea</span></div><div id="preview-content" class="space-y-4"><div class="text-center py-16 text-slate-500 space-y-3"><div class="w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mx-auto text-slate-400 text-2xl"><i class="fa-solid fa-compass-drafting"></i></div><p class="text-base font-medium text-slate-400">Tu idea aparecerá aquí</p><p class="text-xs text-slate-600 max-w-xs mx-auto">Escribe en el cuadro para transformar tu visión en una propuesta estructurada por ForgeLock.</p></div></div></div><div id="preview-actions" class="hidden pt-6 mt-6 border-t border-slate-800 flex flex-col sm:flex-row gap-3"><a id="btn-whatsapp" href="#" target="_blank" rel="noopener noreferrer" class="flex-1 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg flex items-center justify-center gap-2 text-center"><i class="fa-brands fa-whatsapp text-lg"></i><span>💬 Quiero esta idea</span></a><button id="btn-edit-idea" type="button" class="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all border border-slate-700 flex items-center justify-center gap-2"><i class="fa-solid fa-pen"></i><span>Editar mi idea</span></button></div></div></div></div></div>`;
    },

    updatePreview(proposal, isDraft = false) {
        const contentContainer = document.querySelector('#preview-content');
        const badgeStatus = document.querySelector('#badge-status');
        const previewActions = document.querySelector('#preview-actions');
        if (!contentContainer || !badgeStatus || !previewActions) return;
        badgeStatus.textContent = isDraft ? 'Borrador en vivo' : 'Propuesta lista';
        badgeStatus.className = `px-2.5 py-1 rounded-full text-xs font-semibold border ${isDraft ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-brand-500/10 text-brand-400 border-brand-500/20'}`;
        if (!isDraft) previewActions.classList.remove('hidden');
        contentContainer.innerHTML = `<div class="space-y-4 text-sm"><div><h3 class="text-lg font-bold text-white flex items-center gap-2"><i class="fa-solid fa-store text-brand-400 text-sm"></i><span>${escapeHtml(proposal.businessName)}</span></h3><p class="text-xs text-brand-400/90 font-medium mt-1">${escapeHtml(proposal.sector)}</p></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><div class="bg-slate-900/70 p-3 rounded-xl border border-slate-800"><span class="text-xs text-slate-400 block font-medium">Objetivo</span><span class="text-slate-200 text-xs">${escapeHtml(proposal.objective)}</span></div><div class="bg-slate-900/70 p-3 rounded-xl border border-slate-800"><span class="text-xs text-slate-400 block font-medium">Estilo visual</span><span class="text-slate-200 text-xs">${escapeHtml(proposal.visualStyle)}</span></div></div><div class="bg-slate-900/70 p-3 rounded-xl border border-slate-800"><span class="text-xs text-slate-400 block font-medium">Colores sugeridos</span><span class="text-slate-200 text-xs">${escapeHtml(proposal.colorsSuggested)}</span></div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="bg-slate-900/70 p-3 rounded-xl border border-slate-800"><span class="text-xs text-brand-400 font-semibold block mb-2">Secciones recomendadas</span><ul class="text-xs text-slate-300 space-y-1">${listMarkup(proposal.pageStructure)}</ul></div><div class="bg-slate-900/70 p-3 rounded-xl border border-slate-800"><span class="text-xs text-brand-400 font-semibold block mb-2">Funcionalidades</span><ul class="text-xs text-slate-300 space-y-1">${listMarkup(proposal.functionalities)}</ul></div></div><div class="text-xs text-slate-400 bg-brand-500/5 border border-brand-500/10 p-3 rounded-xl"><span class="font-semibold text-brand-400">Llamado a la acción:</span> ${escapeHtml(proposal.callToAction)}<br><span class="font-semibold text-brand-400">Por definir:</span> ${escapeHtml(proposal.pendingInfo)}</div></div>`;
    },

    showLoading(show, message = 'Estamos organizando tu idea…') {
        const loader = document.querySelector('#preview-loading');
        const textElement = document.querySelector('#loading-text');
        if (!loader) return;
        if (textElement) textElement.textContent = message;
        loader.classList.toggle('hidden', !show);
    },

    showError(message) {
        const errorBox = document.querySelector('#form-error-msg');
        const errorText = document.querySelector('#error-text');
        if (errorBox && errorText) {
            errorText.textContent = message;
            errorBox.classList.remove('hidden');
        }
    },

    hideError() {
        document.querySelector('#form-error-msg')?.classList.add('hidden');
    }
};