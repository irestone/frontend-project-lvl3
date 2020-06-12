import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      pageTitle: 'RSS Reader',
      title: 'RSS Reader',
      lead: 'Start reading RSS today! It is easy, it is nicely.',
      rssForm: {
        url: {
          placeholder: 'rss link',
          errors: {
            notUnique: 'Channel with that url is already in the list',
          },
        },
        submit: 'Add',
        feedback: {
          succeeded: 'Channel has been added to the list',
          failed: 'Unexpected error occurred',
        },
      },
      channels: {
        title: 'Channels',
      },
      posts: {
        title: 'Posts',
      },
    },
  },
  ru: {
    translation: {
      pageTitle: 'RSS Reader',
      title: 'RSS Reader',
      lead: 'Начните читать RSS сегодня! Это легко, это приятно.',
      rssForm: {
        url: {
          placeholder: 'ссылка на rss',
          errors: {
            notUnique: 'Канал с такой ссылкой уже есть в списке',
          },
        },
        submit: 'Добавить',
        feedback: {
          succeeded: 'Канал добавлен в список',
          failed: 'Произошла непредвиденная ошибка',
        },
      },
      channels: {
        title: 'Каналы',
      },
      posts: {
        title: 'Посты',
      },
    },
  },
};

const getEl = (id) => document.getElementById(id);

const insertTexts = () => {
  getEl('page-title').innerText = i18next.t('pageTitle');
  getEl('title').innerText = i18next.t('title');
  getEl('lead').innerText = i18next.t('lead');
  getEl('rss-form__url-input').setAttribute(
    'placeholder',
    i18next.t('rssForm.url.placeholder'),
  );
  getEl('rss-form__submit-button').innerText = i18next.t('rssForm.submit');
  getEl('channels__title').innerText = i18next.t('channels.title');
  getEl('posts__title').innerText = i18next.t('posts.title');
};

export { i18next };
export default () => i18next
  .use(LanguageDetector)
  .init({ debug: true, fallbackLng: 'ru', resources })
  .then(insertTexts);
