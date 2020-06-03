// @ts-check

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import onChange from 'on-change';
import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';

const rssFormEl = document.getElementById('rss-form');
const rssFormInputEl = document.getElementById('rss-form-input');
const channelsEl = document.getElementById('channels');
const feedEl = document.getElementById('feed');

// Renderers

const renderRSSForm = (rssFormState) => {
  rssFormInputEl.value = rssFormState.data.url;

  if (rssFormState.state === 'invalid' && !_.isEmpty(rssFormState.data.url)) {
    rssFormInputEl.classList.add('is-invalid');
  } else {
    rssFormInputEl.classList.remove('is-invalid');
  }
};

const renderChannels = (channelsState) => {
  const channelsHTML = channelsState.map(({ title, description, link }) => [
    `<dt><a href="${link}">${title}</a></dt>`,
    `<dd>${description}</dd>`,
  ].join(''));
  channelsEl.innerHTML = channelsHTML.join('<hr>');
  // console.log(channelsState);
};

const renderFeed = (feedState) => {
  const feedHTML = feedState.map(({ title, description, link }) => [
    `<dt><a href="${link}">${title}</a></dt>`,
    `<dd>${description}</dd>`,
  ].join(''));
  feedEl.innerHTML = feedHTML.join('<hr>');
  // console.log(feedState);
};

// State

const state = onChange({
  forms: {
    rss: {
      state: 'valid',
      data: {
        url: 'https://ru.hexlet.io/lessons.rss',
      },
    },
  },
  channels: [],
  feed: [],
}, (path) => {
  if (path.startsWith('forms.rss')) {
    renderRSSForm(state.forms.rss);
    return;
  }

  if (path === 'channels') {
    renderChannels(state.channels);
    return;
  }

  if (path === 'feed') {
    renderFeed(state.feed);
  }
});

// Controllers

// todo: custom yup validation of duplication (e.g. .rssLink())
const schema = yup.string().required().url();
const validateRSSForm = () => {
  state.forms.rss.state = schema.isValidSync(state.forms.rss.data.url)
    && !state.channels.some(({ url }) => url === state.forms.rss.data.url)
    ? 'valid'
    : 'invalid';
};

rssFormInputEl.oninput = (e) => {
  state.forms.rss.data.url = e.target.value;
  validateRSSForm();
};

rssFormEl.onsubmit = (e) => {
  e.preventDefault();

  validateRSSForm();

  if (state.forms.rss.state === 'invalid') {
    return;
  }

  // todo: cors
  axios.get(state.forms.rss.data.url).then((response) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(response.data, 'application/xml');

    const channel = {
      title: _.trim(doc.querySelector('channel > title').textContent),
      description: _.trim(doc.querySelector('channel > description').textContent),
      link: _.trim(doc.querySelector('channel > link').textContent),
      url: state.forms.rss.data.url,
    };

    const items = [...doc.querySelectorAll('item')].map((itemEl) => ({
      title: _.trim(itemEl.querySelector('title').textContent),
      description: _.trim(itemEl.querySelector('description').textContent),
      link: _.trim(itemEl.querySelector('link').textContent),
      pubDate: new Date(_.trim(itemEl.querySelector('pubDate').textContent)),
    }));

    state.channels = [channel, ...state.channels];
    state.feed = [...items, ...state.feed];
  });
};

// MOUNT

renderRSSForm(state.forms.rss);
