// @ts-check

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import onChange from 'on-change';
import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';

import translate from './i18n';
import {
  doc, renderRSSForm, renderChannels, renderPosts,
} from './renderers';

// =====================================
//  STATE
// =====================================

const state = onChange({
  rssForm: {
    state: 'initial', // initial, filling, pending ... ? succeeded, failed
    isValid: false,
    errors: [],
    data: {
      url: 'https://ru.hexlet.io/lessons.rss',
    },
  },
  channels: [],
  posts: [],
}, (path) => {
  if (path.startsWith('rssForm')) {
    renderRSSForm(state.rssForm);
    return;
  }

  if (path === 'channels') {
    renderChannels(state.channels);
    return;
  }

  if (path === 'posts') {
    renderPosts(state.posts);
  }
});

// =====================================
//  CONTROLLERS
// =====================================

const RSSFormSchema = yup.object().shape({
  // todo: custom message for url
  url: yup.string().required().url().test(
    'is-unique-channel-url',
    'rssForm.url.errors.notUnique',
    (url) => !state.channels.some((channel) => channel.url === url),
  ),
});

const validateRSSForm = () => {
  RSSFormSchema
    .validate(state.rssForm.data)
    .then(() => {
      state.rssForm.isValid = true;
      state.rssForm.errors = [];
    })
    .catch(({ errors }) => {
      state.rssForm.isValid = false;
      state.rssForm.errors = errors;
    });
};

const resetRSSForm = () => {
  doc.rssForm.urlInput.value = '';
  state.rssForm.data.url = '';
  state.rssForm.state = 'initial';
};

doc.rssForm.urlInput.oninput = (e) => {
  state.rssForm.data.url = _.trim(e.target.value);
  state.rssForm.state = state.rssForm.data.url;
  if (state.rssForm.data.url) {
    state.rssForm.state = 'filling';
    validateRSSForm();
  } else {
    state.rssForm.state = 'initial';
  }
};

doc.rssForm.form.onsubmit = (e) => {
  e.preventDefault();
  validateRSSForm();

  console.log('submit?');

  if (!state.rssForm.isValid) {
    console.log('no');
    return;
  }

  console.log('yas');

  state.rssForm.state = 'pending';

  // todo: cors
  axios.get(state.rssForm.data.url).then((response) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(response.data, 'application/xml');

    const channel = {
      id: _.uniqueId('channel'),
      url: state.rssForm.data.url,
      title: _.trim(doc.querySelector('channel > title').textContent),
      description: _.trim(doc.querySelector('channel > description').textContent),
      link: _.trim(doc.querySelector('channel > link').textContent),
    };

    const items = [...doc.querySelectorAll('item')].map((itemEl) => ({
      channelId: channel.id,
      id: _.trim(itemEl.querySelector('guid').textContent),
      title: _.trim(itemEl.querySelector('title').textContent),
      description: _.trim(itemEl.querySelector('description').textContent),
      link: _.trim(itemEl.querySelector('link').textContent),
    }));

    state.channels = [channel, ...state.channels];
    state.posts = [...items, ...state.posts];

    resetRSSForm();

    state.rssForm.state = 'succeeded';
  }).catch(() => {
    state.rssForm.state = 'failed';
  });
};

// todo~ proper watcher
// watch when there are channels to watch
const watchRSS = () => {
  setTimeout(() => {
    const requests = state.channels.map((channel) => {
      return axios.get(channel.url).then((response) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(response.data, 'application/xml');

        const items = [...doc.querySelectorAll('item')].map((itemEl) => ({
          channelId: channel.id,
          id: _.trim(itemEl.querySelector('guid').textContent),
          title: _.trim(itemEl.querySelector('title').textContent),
          description: _.trim(itemEl.querySelector('description').textContent),
          link: _.trim(itemEl.querySelector('link').textContent),
        }));

        const newItems = _.differenceBy(
          items,
          state.posts,
          (item) => item.channelId + item.id,
        );

        if (newItems.length) {
          state.posts = [...newItems, ...state.posts];
        }
      });
    });

    Promise.all(requests).then(watchRSS);
  }, 5000);
};

// Mount
validateRSSForm();
renderRSSForm(state.rssForm);
renderChannels(state.channels);
renderPosts(state.posts);
watchRSS();
translate();
