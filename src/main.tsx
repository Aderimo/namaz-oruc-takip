import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import i18n from './i18n'
import './index.css'
import App from './App.tsx'

// Sync <html lang> attribute with current language
function syncHtmlLang(lang: string) {
  document.documentElement.lang = lang;
}
syncHtmlLang(i18n.language);
i18n.on('languageChanged', syncHtmlLang);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
