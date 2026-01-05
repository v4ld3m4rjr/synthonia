import React, { useEffect, useState } from 'react';
import { Button } from './Button';

type ConsentPrefs = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
};

const STORAGE_KEY = 'COOKIE_CONSENT_V1';

const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [openConfig, setOpenConfig] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setVisible(true);
      }
    } catch (_) {
      setVisible(true);
    }
  }, []);

  const savePrefs = (prefs: ConsentPrefs) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (_) {
      // ignorar erros de armazenamento
    }
    // Notificar outros módulos (ex.: analytics) sobre mudança de consentimento
    window.dispatchEvent(new CustomEvent('cookie-consent-updated', { detail: prefs }));
  };

  const handleAcceptAll = () => {
    const prefs: ConsentPrefs = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    savePrefs(prefs);
    setVisible(false);
    setOpenConfig(false);
  };

  const handleSave = () => {
    const prefs: ConsentPrefs = {
      necessary: true,
      analytics,
      marketing,
      timestamp: new Date().toISOString(),
    };
    savePrefs(prefs);
    setVisible(false);
    setOpenConfig(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-4 mb-4 rounded-lg bg-gray-900/95 text-gray-100 shadow-lg border border-gray-800">
        <div className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-sm leading-relaxed">
            <p className="font-semibold">Usamos cookies para melhorar sua experiência.</p>
            <p>
              Utilizamos cookies necessários e, com sua permissão, cookies de análise e marketing.
              Você pode <button className="underline underline-offset-2 text-blue-300 hover:text-blue-200" onClick={() => setOpenConfig(v => !v)}>configurar suas preferências</button> a qualquer momento.
              Consulte nossa <a href="/privacy.html" className="underline underline-offset-2 text-blue-300 hover:text-blue-200" target="_blank" rel="noreferrer">Política de Privacidade</a>.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="md" onClick={() => setOpenConfig(true)}>
              Configurar
            </Button>
            <Button variant="primary" size="md" onClick={handleAcceptAll}>
              Aceitar todos
            </Button>
          </div>
        </div>

        {openConfig && (
          <div className="px-4 pb-4">
            <div className="rounded-md bg-gray-800/80 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Necessários</p>
                  <p className="text-xs text-gray-400">Essenciais para funcionamento do site. Sempre ativos.</p>
                </div>
                <label className="inline-flex items-center">
                  <input type="checkbox" checked readOnly className="w-4 h-4" />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Análise</p>
                  <p className="text-xs text-gray-400">Ajuda a entender uso do site para melhorar funcionalidades.</p>
                </div>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="w-4 h-4"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Marketing</p>
                  <p className="text-xs text-gray-400">Conteúdos e ofertas relevantes baseados em suas interações.</p>
                </div>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="w-4 h-4"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" size="md" onClick={() => setOpenConfig(false)}>Cancelar</Button>
                <Button variant="primary" size="md" onClick={handleSave}>Salvar preferências</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieConsent;