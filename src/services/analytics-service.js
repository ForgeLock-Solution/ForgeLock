const trackedViewTargets = new WeakSet();
let initialized = false;

const hasAnalyticsConsent = () => {
    try {
        return window.localStorage.getItem('forgelock_analytics_consent') === 'accepted'
            && document.documentElement.dataset.forgeLockAnalytics === 'loaded';
    } catch {
        return false;
    }
};

const sendEvent = (eventName, parameters = {}) => {
    if (!hasAnalyticsConsent() || typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, parameters);
};

const cleanLinkUrl = (href) => {
    try {
        const url = new URL(href, window.location.href);
        if (/wa\.me$/i.test(url.hostname)) return url.origin;
        return `${url.origin}${url.pathname}`;
    } catch {
        return href;
    }
};

const linkText = (link) => link.textContent.trim().replace(/\s+/g, ' ').slice(0, 100);
const isWhatsAppLink = (href) => /(?:wa\.me|api\.whatsapp\.com|whatsapp\.com)/i.test(href);

const trackSocialClick = (link, href) => {
    const parameters = { link_url: cleanLinkUrl(href), link_text: linkText(link) };
    if (/instagram\.com/i.test(href)) sendEvent('instagram_click', parameters);
    if (/facebook\.com/i.test(href)) sendEvent('facebook_click', parameters);
};

const trackServiceSelection = (button) => {
    const serviceIndex = Number(button.dataset.banner);
    const service = Number.isInteger(serviceIndex) ? window.__FORGELOCK_APP_SERVICES?.[serviceIndex] : null;
    sendEvent('select_service', { service_name: service || linkText(button) });
};

const observeServices = () => {
    const servicesSection = document.querySelector('#servicios');
    if (!servicesSection || trackedViewTargets.has(servicesSection) || typeof window.IntersectionObserver !== 'function') return;

    const observer = new window.IntersectionObserver((entries, currentObserver) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        sendEvent('view_services');
        currentObserver.disconnect();
    }, { threshold: 0.25 });

    observer.observe(servicesSection);
    trackedViewTargets.add(servicesSection);
};

export const AnalyticsService = {
    init() {
        if (initialized && document.documentElement.dataset.forgeLockAnalytics === 'ready') return;
        initialized = true;
        document.documentElement.dataset.forgeLockAnalytics = 'ready';

        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[href]');
            const serviceButton = event.target.closest('[data-banner]');

            if (link) {
                const href = link.getAttribute('href') || '';
                const parameters = { link_url: cleanLinkUrl(href), link_text: linkText(link) };
                if (isWhatsAppLink(href)) sendEvent('whatsapp_click', parameters);
                trackSocialClick(link, href);

                if (link.id === 'btn-whatsapp' && link.dataset.ideaReady === 'true') {
                    sendEvent('submit_idea', { submission_method: 'idea_form' });
                }
            }

            if (serviceButton) trackServiceSelection(serviceButton);
        });

        observeServices();
    },

    // Queda listo para el día en que exista un formulario real de contacto.
    trackGenerateLead(method = 'contact_form') {
        sendEvent('generate_lead', { method });
    },

    refreshObservers() {
        observeServices();
    }
};
