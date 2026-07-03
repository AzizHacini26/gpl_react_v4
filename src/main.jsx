import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './assets/styles/tokens.css';
import './assets/styles/global.css';
import './assets/styles/dashboard.css';
import './i18n';
import App from './app/App.jsx';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
