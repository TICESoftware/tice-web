import { useLoggerStore } from '@/stores/LoggerStore'
import { createI18n } from 'vue-i18n'
import { languages } from "@/lang"

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: languages
})

const loadedLanguages = ['en', 'de'];
function setI18nLanguage(lang) {
    i18n.global.locale.value = lang;
    // Vue.prototype.$timeago.locale = lang;
    // document.querySelector('html').setAttribute('lang', lang);
    return lang;
}

export function setLanguage(lang) {
  const Logger = useLoggerStore()

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
