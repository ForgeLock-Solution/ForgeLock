import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { installAnalyticsConsent } from './services/analyticsConsent';
import './styles/tailwind.input.css';
import './vendor/fontawesome/css/all.min.css';
import './vendor/inter/inter.css';
import './styles/app.css';

installAnalyticsConsent();

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
