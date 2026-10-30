import { ServicePageModel } from '../models/service-page-model.js';
import { ServicePageView } from '../views/service-page-view.js';

export const ServicePageController = {
    init() {
        const tabs = [...document.querySelectorAll('[role="tab"][data-service]')];
        const initialService = new URLSearchParams(window.location.search).get('servicio');
        const initialTab = ServicePageModel.services[initialService] ? initialService : 'landing';
        ServicePageView.update(initialTab);

        document.querySelector('[role="tablist"]').addEventListener('click', (event) => {
            const tab = event.target.closest('[role="tab"][data-service]');
            if (tab) ServicePageView.update(tab.dataset.service);
        });

        document.querySelector('[role="tablist"]').addEventListener('keydown', (event) => {
            const currentIndex = tabs.indexOf(event.target.closest('[role="tab"][data-service]'));
            if (currentIndex < 0) return;

            let nextIndex;
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % tabs.length;
            else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            else if (event.key === 'Home') nextIndex = 0;
            else if (event.key === 'End') nextIndex = tabs.length - 1;
            else return;

            event.preventDefault();
            tabs[nextIndex].focus();
            ServicePageView.update(tabs[nextIndex].dataset.service);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => ServicePageController.init());
