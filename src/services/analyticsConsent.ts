export const CONSENT_STORAGE_KEY = 'forgelock_cookie_consent';
export const GA_MEASUREMENT_ID = 'G-2TM3PHXG24';
export const GTM_CONTAINER_ID = 'GTM-WJMDTTWM';
export const CONSENT_CHANGE_EVENT = 'forgelock:consent-change';

type AnalyticsWindow = Window & typeof globalThis & {
  dataLayer?: unknown[][];
  gtag?: (...args: unknown[]) => void;
};

function hasAcceptedConsent(win: AnalyticsWindow): boolean {
  try {
    return win.localStorage.getItem(CONSENT_STORAGE_KEY) === 'accepted';
  } catch {
    return false;
  }
}

function setGoogleConsent(win: AnalyticsWindow, accepted: boolean) {
  win.dataLayer = win.dataLayer || [];
  win.gtag = win.gtag || function gtag(...args: unknown[]) { win.dataLayer?.push(args); };
  win.gtag('consent', 'update', {
    analytics_storage: accepted ? 'granted' : 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });
}

function loadAnalytics(win: AnalyticsWindow) {
  if (win.document.querySelector('[data-forgelock-analytics="ga4"]')) return;
  win.dataLayer = win.dataLayer || [];
  win.gtag = win.gtag || function gtag(...args: unknown[]) { win.dataLayer?.push(args); };
  win.gtag('js', new Date());
  win.gtag('config', GA_MEASUREMENT_ID);

  const gaScript = win.document.createElement('script');
  gaScript.async = true;
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  gaScript.dataset.forgelockAnalytics = 'ga4';
  win.document.head.appendChild(gaScript);

  const gtmScript = win.document.createElement('script');
  gtmScript.async = true;
  gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_CONTAINER_ID}`;
  gtmScript.dataset.forgelockAnalytics = 'gtm';
  win.document.head.appendChild(gtmScript);
}

/** Installs analytics only after explicit acceptance of the site's saved preference. */
export function installAnalyticsConsent(win: AnalyticsWindow = window as AnalyticsWindow) {
  const applyPreference = (accepted: boolean) => {
    if (accepted) {
      setGoogleConsent(win, true);
      loadAnalytics(win);
    } else if (win.gtag) {
      setGoogleConsent(win, false);
    }
  };

  const onPreferenceChanged = (event: Event) => {
    const accepted = (event as CustomEvent<{ accepted?: boolean }>).detail?.accepted === true;
    applyPreference(accepted);
  };
  const onStorageChanged = (event: StorageEvent) => {
    if (event.key === CONSENT_STORAGE_KEY) applyPreference(event.newValue === 'accepted');
  };

  win.addEventListener(CONSENT_CHANGE_EVENT, onPreferenceChanged);
  win.addEventListener('storage', onStorageChanged);
  applyPreference(hasAcceptedConsent(win));

  return () => {
    win.removeEventListener(CONSENT_CHANGE_EVENT, onPreferenceChanged);
    win.removeEventListener('storage', onStorageChanged);
  };
}
