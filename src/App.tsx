import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SolutionsCarousel } from './components/SolutionsCarousel';
import { NeedFinder } from './components/NeedFinder';
import { ServicesCatalog } from './components/ServicesCatalog';
import { Workflow } from './components/Workflow';
import { HelpAndCta } from './components/HelpAndCta';
import { Footer } from './components/Footer';
import { ServiceFicheModal } from './components/ServiceFicheModal';
import { LegalModal, LegalDocType } from './components/LegalModal';
import { CookieConsent } from './components/CookieConsent';
import { Service } from './types';
import { SERVICE_BY_ID } from './data/services';

export const App: React.FC = () => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [ficheService, setFicheService] = useState<Service | null>(null);
  const [activeLegal, setActiveLegal] = useState<LegalDocType | null>(null);
  const [cookieSettingsOpen, setCookieSettingsOpen] = useState(false);

  const handleExploreServices = () => {
    setSelectedService(SERVICE_BY_ID.landing || null);
    const el = document.querySelector('#servicios');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTellIdea = () => {
    const el = document.querySelector('#necesidad');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      const textarea = document.querySelector('#idea-textarea') as HTMLTextAreaElement | null;
      textarea?.focus();
    }
  };

  const handleOpenFiche = (service: Service) => {
    setFicheService(service);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-brand-500 selection:text-slate-950">
      {/* Navigation */}
      <Navbar
        onSelectService={(id) => {
          if (id && SERVICE_BY_ID[id]) {
            setSelectedService(SERVICE_BY_ID[id]);
          } else {
            setSelectedService(null);
          }
        }}
        onOpenLegal={(doc) => setActiveLegal(doc)}
      />

      {/* Main Content Sections */}
      <main className="flex-grow">
        <Hero onExploreServices={handleExploreServices} />
        
        <SolutionsCarousel
          onSelectService={(service) => {
            setSelectedService(service);
            const el = document.querySelector('#servicios');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        <NeedFinder />

        <ServicesCatalog
          selectedService={selectedService}
          onSelectService={(service) => setSelectedService(service)}
          onOpenFiche={handleOpenFiche}
        />

        <Workflow />

        <HelpAndCta onTellIdea={handleTellIdea} />
      </main>

      {/* Footer */}
      <Footer
        onOpenLegal={(doc) => setActiveLegal(doc)}
        onOpenCookieSettings={() => setCookieSettingsOpen(true)}
      />

      {/* Service Fiche Modal */}
      <ServiceFicheModal
        service={ficheService}
        onClose={() => setFicheService(null)}
        onSelectService={(newService) => setFicheService(newService)}
      />

      {/* Legal Information Modal */}
      <LegalModal
        page={activeLegal}
        onClose={() => setActiveLegal(null)}
      />

      {/* Cookie Consent Banner */}
      <CookieConsent
        forceOpen={cookieSettingsOpen}
        onCloseSettings={() => setCookieSettingsOpen(false)}
        onOpenCookiePolicy={() => {
          setActiveLegal('politica-cookies');
        }}
      />
    </div>
  );
};
export default App;
