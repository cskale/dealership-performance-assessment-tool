import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../i18n/en.json';
import de from '../i18n/de.json';
import fr from '../i18n/fr.json';
import es from '../i18n/es.json';
import it from '../i18n/it.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    de: { translation: de },
    fr: { translation: fr },
    es: { translation: es },
    it: { translation: it },
  },
  lng: localStorage.getItem('app_language') || localStorage.getItem('language') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
