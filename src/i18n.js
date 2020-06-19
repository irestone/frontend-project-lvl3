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
          validationErrors: {
            notUnique: 'The channel is already in the list',
            required: 'A link is required',
            invalidUrl: 'Invalid url',
          },
        },
        submit: 'Add',
        feedback: {
          succeeded: 'The channel has been added',
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
      errors: {
        unexpected: 'Unexpected error occurred',
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
          validationErrors: {
            notUnique: 'Канал уже есть в списке',
            required: 'Ссылка обязательна',
            invalidUrl: 'Некорректная ссылка',
          },
        },
        submit: 'Добавить',
        feedback: {
          succeeded: 'Канал добавлен',
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
      errors: {
        unexpected: 'Произошла непредвиденная ошибка',
      },
    },
  },
};

const init = (i18nextInstance) => i18nextInstance
  .use(LanguageDetector)
  .init({ debug: true, fallbackLng: 'ru', resources });

export { init, i18next };
