// @ts-check

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import _ from 'lodash';
import onChange from 'on-change';
import i18next from 'i18next';

import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import {
  insertTexts, renderRSSForm, renderChannels, renderPosts,
} from './renderers';
import { handleRSSFormUpdate, handleChannelSubmission, watchChannels } from './controllers';

import en from './locales/en.json';
import ru from './locales/ru.json';

// Collecting DOM elements

const doc = {
  pageTitle: document.getElementById('page-title'),
  title: document.getElementById('title'),
  lead: document.getElementById('lead'),
  rssForm: {
    form: document.getElementById('rss-form'),
    urlInput: document.getElementById('rss-form__url-input'),
    submitButton: document.getElementById('rss-form__submit-button'),
  },
  feedback: document.getElementById('feedback'),
  channels: {
    title: document.getElementById('channels__title'),
    list: document.getElementById('channels__list'),
  },
  posts: {
    title: document.getElementById('posts__title'),
    list: document.getElementById('posts__list'),
  },
};

// Initializing state

const state = onChange(
  {
    rssForm: {
    // ? should i use a map or smth to get rid of strings?
      state: 'filling', // filling | processing | processed
      isValid: true,
      errors: [],
      url: '',
    },
    channels: [],
    posts: [],
  },
  (path) => {
    if (path.startsWith('rssForm')) {
      renderRSSForm(doc, state.rssForm, i18next);
      return;
    }

    if (path === 'channels') {
      renderChannels(doc, state.channels, i18next);
      return;
    }

    if (path === 'posts') {
      renderPosts(doc, state.posts, i18next);
    }
  },
);

// Assigning controllers

doc.rssForm.urlInput.oninput = (e) => handleRSSFormUpdate(state, _.trim(e.target.value));

doc.rssForm.form.onsubmit = (e) => {
  e.preventDefault();
  handleChannelSubmission(state);
};

// Mounting

insertTexts(
  doc,
  () => {
    return i18next
      .use(I18nextBrowserLanguageDetector)
      .init({
        debug: true,
        fallbackLng: 'ru',
        resources: {
          en: { translation: en },
          ru: { translation: ru },
        },
      });
  },
  i18next,
);

renderRSSForm(doc, state.rssForm, i18next);
renderChannels(doc, state.channels, i18next);
renderPosts(doc, state.posts, i18next);

watchChannels(state);
