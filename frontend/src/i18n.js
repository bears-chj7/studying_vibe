import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationKO from './locales/ko/translation.json';

// the translations
const resources = {
    en: {
        translation: translationEN
    },
    ko: {
        translation: translationKO
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        fallbackLng: 'en', // default language
        debug: true,

        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
