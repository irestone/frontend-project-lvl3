// @ts-check

import _ from 'lodash';
import onChange from 'on-change';
import i18next from 'i18next';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';

import { handleRSSFormUpdate, handleChannelSubmission, updateChannelPosts } from './controllers';
import locales from './locales';
import { createWatcher, initRender } from './watcher';

export default (document) => {
  const FEED_UPDATE_FREQUENCY = 5000;

  // Collecting DOM elements

  const documentElements = {
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
        channelAddingProcess: {
          state: 'empty', // empty | valid/invalid | sending | failed/succeeded
          errors: [],
        },
        url: '',
      },
      channels: [],
      posts: [],
    },
    createWatcher(documentElements),
  );

  // Assigning controllers

  documentElements.rssForm.urlInput.oninput = (e) => {
    handleRSSFormUpdate(state, _.trim(e.target.value));
  };

  documentElements.rssForm.form.onsubmit = (e) => {
    e.preventDefault();
    handleChannelSubmission(state);
  };

  // Mounting


  const watchChannels = () => {
    setTimeout(() => {
      const updateRequests = state.channels
        .map((channel) => updateChannelPosts(state, channel));
      Promise.all(updateRequests)
        .finally(() => watchChannels(state, FEED_UPDATE_FREQUENCY));
    }, FEED_UPDATE_FREQUENCY);
  };

  i18next
    .use(I18nextBrowserLanguageDetector)
    .init({ debug: true, fallbackLng: 'ru', resources: locales })
    .then(() => {
      initRender(documentElements, state);
      watchChannels(state);
    });
};
