import React, { useState, useEffect } from 'react';
import { CONSENT_CHANGE_EVENT, CONSENT_STORAGE_KEY } from '../services/analyticsConsent';

interface CookieConsentProps {
  forceOpen: boolean;
  onCloseSettings: () => void;
  onOpenCookiePolicy: () => void;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({
  forceOpen,
  onCloseSettings,
  onOpenCookiePolicy
}) => {
  const [consent, setConsent] = useState<'accepted' | 'rejected' | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(CONSENT_STORAGE_KEY); } catch { /* Sin almacenamiento persistente, no se considera consentimiento. */ }
    if (saved === 'accepted' || saved === 'rejected') {
      setConsent(saved);
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    if (forceOpen) {
      setIsVisible(true);
    }
  }, [forceOpen]);

  const handleAccept = () => {
    let persisted = false;
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, 'accepted');
      persisted = localStorage.getItem(CONSENT_STORAGE_KEY) === 'accepted';
    } catch { /* La analítica se mantiene desactivada si no se puede guardar la preferencia. */ }
    if (!persisted) return;
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: { accepted: true } }));
    setConsent('accepted');
    setIsVisible(false);
    onCloseSettings();
  };

  const handleReject = () => {
    try { localStorage.setItem(CONSENT_STORAGE_KEY, 'rejected'); } catch { /* La analítica no se activa cuando no se puede guardar la preferencia. */ }
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: { accepted: false } }));
    setConsent('rejected');
    setIsVisible(false);
    onCloseSettings();
  };

  if (!isVisible) return null;

  return (
    <aside
      id="cookie-consent"
      className="fixed bottom-0 inset-x-0 z-[100] p-4 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 shadow-2xl transition-all"
      role="dialog"
      aria-label="Preferencias de cookies"
    >
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="text-sm text-slate-300 max-w-3xl">
          <strong className="text-white">Privacidad y analítica.</strong> La analítica es opcional. Puedes aceptar o rechazarla.{' '}
          <button
            type="button"
            onClick={onOpenCookiePolicy}
            className="text-brand-400 underline hover:text-brand-300 cursor-pointer"
          >
            Ver política de cookies
          </button>
          .
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            id="cookie-reject"
            type="button"
            onClick={handleReject}
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-colors cursor-pointer"
          >
            Rechazar
          </button>
          <button
            id="cookie-accept"
            type="button"
            onClick={handleAccept}
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-slate-950 font-bold text-sm transition-all shadow-sm cursor-pointer"
          >
            Aceptar analítica
          </button>
        </div>
      </div>
    </aside>
  );
};
