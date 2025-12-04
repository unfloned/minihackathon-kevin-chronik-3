import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { de } from './locales/de';
import { en } from './locales/en';

const savedLanguage = localStorage.getItem('language') || 'de';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            de: { translation: de },
            en: { translation: en },
        },
        lng: savedLanguage,
        fallbackLng: 'de',
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false,
            bindI18n: 'languageChanged loaded',
            bindI18nStore: 'added removed',
        },
    });

// Debug: Log language changes
i18n.on('languageChanged', (lng) => {
    console.log('Language changed to:', lng);
});

export default i18n;
