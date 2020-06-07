// @ts-check

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import onChange from 'on-change';
import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';

import i18n, { init as i18nInit } from './i18n';

const rssFormEl = document.getElementById('rss-form');
const rssFormInputEl = document.getElementById('rss-form-input');
const rssFormSubmitButtonEl = document.getElementById('rss-form-submit-button');
const channelsEl = document.getElementById('channels');
const feedEl = document.getElementById('feed');

// =====================================
//  RENDERERS
// =====================================

const renderRSSForm = (state) => {
  rssFormInputEl.value = state.data.url;

  // todo: states - submitted (block field, loader instead of button)

  if (state.state === 'initial' || !state.isValid) {
    rssFormSubmitButtonEl.setAttribute('disabled', true);
  } else {
    rssFormSubmitButtonEl.removeAttribute('disabled');
  }

  if (state.state === 'filling' && !state.isValid) {
    rssFormInputEl.classList.add('is-invalid');
    // show errors
  } else {
    rssFormInputEl.classList.remove('is-invalid');
  }
};

const renderChannels = (state) => {
  const channelsHTML = state.channels.map(({ title, description, link }) => [
    `<dt><a href="${link}">${title}</a></dt>`,
    `<dd>${description}</dd>`,
  ].join(''));
  channelsEl.innerHTML = channelsHTML.join('<hr>');
};

const renderPosts = (state) => {
  const postsHTML = state.posts.map(({ title, description, link }) => [
    `<dt><a href="${link}">${title}</a></dt>`,
    `<dd>${description}</dd>`,
  ].join(''));
  feedEl.innerHTML = postsHTML.join('<hr>');
};

// =====================================
//  STATE
// =====================================

const rssFormState = onChange({
  state: 'initial', // initial, filling, submitted ... ? succeeded, failed
  isValid: false,
  errors: [],
  data: {
    url: 'https://ru.hexlet.io/lessons.rss',
  },
}, () => renderRSSForm(rssFormState));

const channelsState = onChange({
  channels: [],
}, () => renderChannels(channelsState));

const postsState = onChange({
  posts: [],
}, () => renderPosts(postsState));

// todo: ui state with notification: state (success/fail), text

// =====================================
//  CONTROLLERS
// =====================================

// todo: custom yup validation of duplication (e.g. .rssLink())
// todo: validate the whole 'data' object (schema.isValid(rssFormState.data))
const schema = yup.string().required().url();
const validateRSSForm = () => {
  rssFormState.isValid = schema.isValidSync(rssFormState.data.url)
    && !channelsState.channels.some(({ url }) => url === rssFormState.data.url);
};

rssFormInputEl.oninput = (e) => {
  rssFormState.data.url = e.target.value;
  rssFormState.state = _.isEmpty(rssFormState.data.url) ? 'initial' : 'filling';
  validateRSSForm();
};

rssFormEl.onsubmit = (e) => {
  e.preventDefault();
  validateRSSForm();

  if (!rssFormState.isValid) {
    return;
  }

  rssFormState.state = 'submitted';

  // todo: cors
  axios.get(rssFormState.data.url).then((response) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(response.data, 'application/xml');

    const channel = {
      id: _.uniqueId('channel'),
      url: rssFormState.data.url,
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

    // todo: notify(success, `Feed ${channel.name} has been successfully added`)

    channelsState.channels = [channel, ...channelsState.channels];
    postsState.posts = [...items, ...postsState.posts];
  }).catch(() => {
    // todo: notify(fail, `Error occured when tried adding ${channel.name}`)
  });
};

const watchRSS = () => {
  setTimeout(() => {
    const requests = channelsState.channels.map((channel) => {
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
          postsState.posts,
          (item) => item.channelId + item.id,
        );

        if (newItems.length) {
          postsState.posts = [...newItems, ...postsState.posts];
        }
      });
    });

    Promise.all(requests).then(watchRSS);
  }, 5000);
};

// Mount
validateRSSForm();
renderRSSForm(rssFormState);
renderChannels(channelsState);
renderPosts(postsState);
watchRSS(); // todo: watch when there are channels to watch
i18nInit(i18n);
