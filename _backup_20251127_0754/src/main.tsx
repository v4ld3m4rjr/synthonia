import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Inject React Refresh preamble only in development to avoid runtime issues in production
if (import.meta.env.DEV) {
  import('/@vite/client');
  import('/@react-refresh').then((RefreshRuntime: any) => {
    RefreshRuntime.injectIntoGlobalHook(window as any);
    (window as any).$RefreshReg$ = () => {};
    (window as any).$RefreshSig$ = () => (type: any) => type;
    (window as any).__vite_plugin_react_preamble_installed__ = true;
  }).catch(() => {
    // ignore if not available
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
