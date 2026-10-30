// Bootstrap clásico compartido: se ejecuta después del banner, incluso sin módulos.
(function () {
    const key = 'forgelock_analytics_consent';
    const banner = document.getElementById('cookie-consent');
    const settings = document.getElementById('cookie-settings');
    let choice = null;
    let returnFocus = null;
    try { choice = localStorage.getItem(key); } catch { /* Preferencia solo en memoria. */ }
    window.__FORGELOCK_ANALYTICS_CONSENT = choice;
    window.__FORGELOCK_ANALYTICS_ID = 'G-2TM3PHXG24';
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    const denied = { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
    window.gtag('consent', 'default', denied);

    function saveChoice(value) {
        choice = value;
        window.__FORGELOCK_ANALYTICS_CONSENT = value;
        try { localStorage.setItem(key, value); } catch { /* Mantener la elección durante esta visita. */ }
    }
    function closeBanner() {
        banner?.classList.add('hidden');
        if (returnFocus?.isConnected) returnFocus.focus();
        returnFocus = null;
    }
    window.__FORGELOCK_LOAD_GTM = function () {
        if (choice !== 'accepted' || window.__FORGELOCK_GTM_LOADING || window.__FORGELOCK_GTM_LOADED) return;
        window.__FORGELOCK_GTM_LOADING = true;
        window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-WJMDTTWM';
        script.onload = function () {
            window.__FORGELOCK_GTM_LOADING = false;
            window.__FORGELOCK_GTM_LOADED = true;
        };
        script.onerror = function () { window.__FORGELOCK_GTM_LOADING = false; script.remove(); };
        document.head.appendChild(script);
    };
    window.__FORGELOCK_LOAD_ANALYTICS = function () {
        if (choice !== 'accepted') return;
        window['ga-disable-' + window.__FORGELOCK_ANALYTICS_ID] = false;
        window.__FORGELOCK_LOAD_GTM();
        if (window.__FORGELOCK_GA_LOADING || window.__FORGELOCK_GA_LOADED) return;
        window.__FORGELOCK_GA_LOADING = true;
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(window.__FORGELOCK_ANALYTICS_ID);
        script.onload = function () {
            window.__FORGELOCK_GA_LOADING = false;
            if (choice !== 'accepted') return;
            window.__FORGELOCK_GA_LOADED = true;
            window.gtag('consent', 'update', { ...denied, analytics_storage: 'granted' });
            window.gtag('js', new Date());
            window.gtag('config', window.__FORGELOCK_ANALYTICS_ID, { send_page_view: true });
            window.gtag('event', 'analytics_consent_granted', { consent_method: 'cookie_banner' });
            if (document.body.dataset.forgelockPage === 'not-found') {
                window.gtag('event', 'page_not_found', { page_path: window.location.pathname });
            }
            document.documentElement.dataset.forgeLockAnalytics = 'loaded';
            document.dispatchEvent(new Event('forgelock:analytics-ready'));
        };
        script.onerror = function () {
            window.__FORGELOCK_GA_LOADING = false;
            script.remove();
            document.documentElement.dataset.forgeLockAnalytics = 'load_error';
        };
        document.head.appendChild(script);
    };
    settings?.addEventListener('click', function () {
        returnFocus = settings;
        banner.classList.remove('hidden');
        document.getElementById('cookie-reject').focus();
    });
    document.getElementById('cookie-accept')?.addEventListener('click', function () {
        saveChoice('accepted');
        closeBanner();
        window.__FORGELOCK_LOAD_ANALYTICS();
    });
    document.getElementById('cookie-reject')?.addEventListener('click', function () {
        const active = window.__FORGELOCK_GA_LOADING || window.__FORGELOCK_GA_LOADED
            || window.__FORGELOCK_GTM_LOADING || window.__FORGELOCK_GTM_LOADED;
        saveChoice('rejected');
        window['ga-disable-' + window.__FORGELOCK_ANALYTICS_ID] = true;
        window.gtag('consent', 'update', denied);
        document.documentElement.dataset.forgeLockAnalytics = 'denied';
        closeBanner();
        // Una recarga descarga también las etiquetas de terceros ya ejecutadas.
        if (active) window.location.reload();
    });
    window.addEventListener('storage', function (event) {
        if (event.key === key && event.newValue !== choice) window.location.reload();
    });
    if (choice === 'accepted') window.__FORGELOCK_LOAD_ANALYTICS();
    else if (choice !== 'rejected') banner?.classList.remove('hidden');
})();
