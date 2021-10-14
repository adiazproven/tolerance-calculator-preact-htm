import es_ES from './locales/es_ES.js';
import en_US from './locales/en_US.js';

const locales = {
    "es-ES": es_ES,
    "en-US": en_US,
}

export default function i18n (id = null) {
    const html = document.getElementsByTagName("html") ? document.getElementsByTagName("html")[0] : null;
    const lang = html && html.lang ? html.lang : "en-US";
    return locales[lang][id] ? locales[lang][id] : "";
}