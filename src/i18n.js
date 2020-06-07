import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const languageSelectorEl = document.getElementById('language-selector');

const EN = 'en';
const RU = 'ru';

const lngs = [EN, RU];
const fallbackLng = EN;

const resources = {
  [EN]: {
    translation: {
      key: 'hello world',
    },
  },
  [RU]: {
    translation: {
      key: 'привет мир',
    },
  },
};

const names = {
  [EN]: 'English',
  [RU]: 'Русский',
};

const init = (i18next) => i18next
  .use(LanguageDetector)
  .init({
    debug: true,
    fallbackLng,
    resources,
  }).then(() => {
    const languageOptionsHTML = lngs.map((code) => {
      return code === i18next.language
        ? `<option value="${code}" selected>${names[code]}</option>`
        : `<option value="${code}">${names[code]}</option>`;
    });
    languageSelectorEl.innerHTML = languageOptionsHTML.join('');

    const updateTexts = () => {
      // document.getElementById('output').innerHTML = i18next.t('key');
    };

    languageSelectorEl.onchange = (e) => i18next.changeLanguage(e.target.value);
    i18next.on('languageChanged', updateTexts);

    updateTexts();
  });

export { init };
export default i18next;
