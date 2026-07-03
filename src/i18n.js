import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import arCommon from './locales/ar/common.json';
import frCommon from './locales/fr/common.json';

const LANGUAGE_KEY = 'appLanguage';
const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
const initialLanguage = savedLanguage === 'fr' ? 'fr' : 'ar';

function applyDocumentLanguage(language) {
  const isArabic = language === 'ar';
  document.documentElement.lang = language;
  document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: { common: arCommon },
      fr: { common: frCommon },
    },
    lng: initialLanguage,
    fallbackLng: 'ar',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });

applyDocumentLanguage(initialLanguage);

i18n.on('languageChanged', (language) => {
  localStorage.setItem(LANGUAGE_KEY, language);
  applyDocumentLanguage(language);
});

export default i18n;
