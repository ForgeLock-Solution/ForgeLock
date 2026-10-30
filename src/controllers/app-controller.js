import { AppModel } from '../models/app-model.js';
import { AppView } from '../views/app-view.js';
import { IdeaController } from './idea-controller.js';
import { AnalyticsService } from '../services/analytics-service.js';

/**
 * CONTROLADOR: conecta los eventos de la interfaz con el Modelo y pide a la Vista
 * volver a pintar únicamente los componentes que cambiaron.
 */
export const AppController = {
    eventsDocument: null,
    init() {
        // Primero se crea el DOM; después se instala una sola delegación de eventos.
        this.renderAll();
        this.setupEventListeners();
        AnalyticsService.init();
        AnalyticsService.refreshObservers();
    },

    renderAll() {
        AppView.renderHeader();
        AppView.renderHero();
        AppView.renderSolutions();
        AppView.renderNeedFinder();
        IdeaController.init();
        AppView.renderServices();
        AppView.renderWorkflow();
        AppView.renderHelpAndCta();
        AppView.renderFooter();
    },

    setupEventListeners() {
        if (this.eventsDocument === document) return;
        this.eventsDocument = document;
        // Delegación: sigue funcionando aunque la Vista reemplace botones con innerHTML.
        document.addEventListener('click', (event) => {
            const menuButton = event.target.closest('#mobile-menu-btn');
            const mobileLink = event.target.closest('.mobile-nav-link');
            const bannerButton = event.target.closest('[data-banner]');

            if (menuButton) {
                AppModel.state.isMenuOpen = !AppModel.state.isMenuOpen;
                AppView.renderHeader();
                document.querySelector('#mobile-menu-btn')?.focus();
            }
            if (mobileLink) {
                AppModel.state.isMenuOpen = false;
                AppView.renderHeader();
                const href = mobileLink.getAttribute('href');
                if (href.startsWith('#')) document.querySelector(href)?.scrollIntoView?.();
            }
            if (bannerButton) {
                AppModel.state.activeBannerIndex = Number(bannerButton.dataset.banner);
                AppView.renderSolutions();
                document.querySelector(`[data-banner="${AppModel.state.activeBannerIndex}"]`)?.focus();
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape' || !AppModel.state.isMenuOpen) return;
            AppModel.state.isMenuOpen = false;
            AppView.renderHeader();
            document.querySelector('#mobile-menu-btn')?.focus();
        });
    },

};

// Punto de inicio de la aplicación cuando los contenedores HTML ya existen.
document.addEventListener('DOMContentLoaded', () => AppController.init());
