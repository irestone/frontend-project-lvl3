// @ts-check

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import _ from 'lodash';

import { init as initState } from './state';
import {
  insertTexts, renderRSSForm, renderChannels, renderPosts,
} from './renderers';
import { handleChannelSubmission, updateRSSForm } from './controllers';

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

const state = initState((path) => {
  if (path.startsWith('rssForm')) {
    renderRSSForm(doc, state.rssForm);
    return;
  }

  if (path === 'channels') {
    renderChannels(doc, state.channels);
    return;
  }

  if (path === 'posts') {
    renderPosts(doc, state.posts);
  }
});

// Assigning controllers

doc.rssForm.urlInput.oninput = (e) => updateRSSForm(state, {
  url: _.trim(e.target.value),
});

doc.rssForm.form.onsubmit = (e) => {
  e.preventDefault();
  handleChannelSubmission(state);
};

// Mounting

insertTexts(doc);
renderRSSForm(doc, state.rssForm);
renderChannels(doc, state.channels);
renderPosts(doc, state.posts);
