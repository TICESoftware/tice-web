import VueI18n from 'vue-i18n';
import Vue from 'vue';
import Logger from './Logger';
import messagesEN from '../lang/en.json';
import messagesDE from '../lang/de.json';

Vue.use(VueI18n);
const messages = { en: messagesEN, de: messagesDE };

export const i18n = new VueI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages,
});

const loadedLanguages = ['en', 'de'];
function setI18nLanguage(lang) {
    i18n.locale = lang;
    Vue.prototype.$timeago.locale = lang;
    document.querySelector('html').setAttribute('lang', lang);
    return lang;
}

export function setLanguage(lang) {
    Logger.debug(`Set language to ${lang}`);
    // If the same language
    if (i18n.locale === lang) {
        return Promise.resolve(setI18nLanguage(lang));
    }

    // If the language was already loaded
    if (loadedLanguages.includes(lang)) {
        return Promise.resolve(setI18nLanguage(lang));
    }
    Logger.warning(`Can't set language to ${lang}, so fall back to english.`);
    return Promise.resolve();

    // If the language hasn't been loaded yet
    // return import(/* webpackChunkName: "lang-[request]" */ `@/lang/${lang}`).then(
    //     (newMessages) => {
    //         i18n.setLocaleMessage(lang, newMessages.default);
    //         loadedLanguages.push(lang);
    //         return setI18nLanguage(lang);
    //     },
    // );
}
