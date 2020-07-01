// @ts-check

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import _ from 'lodash';
import onChange from 'on-change';
import i18next from 'i18next';

import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import {
  insertTexts, renderChannels, renderPosts, renderRSSFormFilling, renderRSSFormSubmission,
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
      fillingState: {
        state: 'empty', // empty | valid/invalid
        errors: [],
        url: '',
      },
      submissionState: {
        state: 'idle', // idle | sending | failed/succeeded
        errors: [],
      },
    },
    channels: [],
    posts: [],
  },
  (path, value) => {
    if (path === 'rssForm.fillingState') {
      renderRSSFormFilling(doc, value, i18next);
      return;
    }
    if (path === 'rssForm.submissionState') {
      renderRSSFormSubmission(doc, value, i18next);
      return;
    }

    if (path === 'channels') {
      renderChannels(doc, value, i18next);
      return;
    }

    if (path === 'posts') {
      renderPosts(doc, value, i18next);
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

renderRSSFormFilling(doc, state.rssForm.fillingState, i18next);
renderChannels(doc, state.channels, i18next);
renderPosts(doc, state.posts, i18next);

watchChannels(state);
