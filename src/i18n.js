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
            notUnique: 'The channel is already in the list',
            required: 'A link is required',
            invalid: 'Invalid url',
          },
        },
        submit: 'Add',
        feedback: {
          succeeded: 'The channel has been added to the list',
          failed: 'Unexpected error occurred',
        },
      },
      channels: {
        title: 'Channels',
        noChannels: 'No channels were added yet',
      },
      posts: {
        title: 'Posts',
        noPosts: 'No posts',
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
            notUnique: 'Канал уже есть в списке',
            required: 'Ссылка обязательна',
            invalid: 'Некорректная ссылка',
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
        noChannels: 'Вы еще не добавили ни одного канала',
      },
      posts: {
        title: 'Посты',
        noPosts: 'Нет постов',
      },
    },
  },
};

const init = (i18nextInstance) => i18nextInstance
  .use(LanguageDetector)
  .init({ debug: true, fallbackLng: 'ru', resources });

export { init, i18next };
