import { AppModel } from '../models/app-model.js';
import { AIService } from '../services/ai-service.js';
import { IdeaGeneratorView } from '../views/idea-generator-view.js';

export const IdeaController = {
    initialized: false,
    currentProposal: null,

    init() {
        const container = document.querySelector('#idea-generator-container');
        if (!container) return;
        IdeaGeneratorView.render(container);
        const textarea = document.querySelector('#idea-textarea');
        if (textarea) textarea.value = AppModel.state.userNeedInput;
        this.currentProposal = null;
        if (this.initialized) return;
        this.initialized = true;
        container.addEventListener('click', (event) => this.handleClick(event));
        container.addEventListener('input', (event) => this.handleInput(event));
    },

    handleClick(event) {
        if (event.target.closest('#btn-generate')) this.handleGenerateIdea();
        if (event.target.closest('#btn-reset')) this.handleReset();
        if (event.target.closest('#btn-edit-idea')) document.querySelector('#idea-textarea')?.focus();
    },

    handleInput(event) {
        if (!event.target.matches('#idea-textarea')) return;
        const value = event.target.value;
        AppModel.state.userNeedInput = value;
        IdeaGeneratorView.hideError();
        if (value.trim().length >= 10) {
            IdeaGeneratorView.updatePreview(AIService.heuristicAnalysis(value), true);
        }
    },

    async handleGenerateIdea() {
        const textarea = document.querySelector('#idea-textarea');
        const userInput = textarea?.value.trim() || '';
        IdeaGeneratorView.hideError();
        if (!userInput) {
            IdeaGeneratorView.showError('Por favor escribe tu idea antes de generar la propuesta.');
            textarea?.focus();
            return;
        }
        if (userInput.length < 10) {
            IdeaGeneratorView.showError('Cuéntanos un poco más sobre tu negocio para poder ayudarte mejor.');
            textarea?.focus();
            return;
        }
        try {
            IdeaGeneratorView.showLoading(true);
            this.currentProposal = await AIService.analyzeIdea(userInput);
            IdeaGeneratorView.updatePreview(this.currentProposal);
            const button = document.querySelector('#btn-whatsapp');
            if (button) {
                button.href = AIService.getWhatsAppLink(userInput, this.currentProposal, AppModel.state.whatsappNumber);
                button.dataset.ideaReady = 'true';
            }
        } catch (error) {
            console.error('Error generando propuesta:', error);
            IdeaGeneratorView.showError('No pudimos generar la propuesta en este momento. Puedes intentarlo nuevamente o contactar directamente con ForgeLock por WhatsApp.');
        } finally {
            IdeaGeneratorView.showLoading(false);
        }
    },

    handleReset() {
        AppModel.state.userNeedInput = '';
        const container = document.querySelector('#idea-generator-container');
        if (!container) return;
        IdeaGeneratorView.render(container);
    }
};