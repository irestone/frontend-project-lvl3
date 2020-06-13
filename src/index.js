// @ts-check

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import onChange from 'on-change';
import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';

import {
  doc, insertTexts, renderRSSForm, renderChannels, renderPosts,
} from './view';
import { parseRSSXML } from './parser';

// fixme: find a way to configurate axios or smth
const corsURL = 'https://cors-anywhere.herokuapp.com/';

// =====================================
//  STATE
// =====================================

// ? should i use fsm?
const state = onChange({
  rssForm: {
    // ? should i use a map or smth for to get rid of strings?
    state: 'initial', // initial, filling, pending, succeeded, failed
    isValid: false,
    errors: [],
    data: {
      url: '',
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

const rssFormSchema = yup.object().shape({
  url: yup
    .string()
    .required('rssForm.url.errors.required')
    .url('rssForm.url.errors.invalid')
    .test(
      'is-unique-channel',
      'rssForm.url.errors.notUnique',
      (url) => !state.channels.some((channel) => channel.url === url),
    ),
});

const validateRSSForm = () => {
  return rssFormSchema
    .validate(state.rssForm.data)
    .then(() => {
      state.rssForm.isValid = true;
      state.rssForm.errors = [];
    })
    .catch((error) => {
      state.rssForm.isValid = false;
      state.rssForm.errors = error.errors;
      throw error;
    });
};

const updateRSSFormUrl = (value) => {
  state.rssForm.data.url = value;
  if (value) {
    state.rssForm.state = 'filling';
    validateRSSForm().catch(_.noop);
  } else {
    state.rssForm.state = 'initial';
  }
};

const resetRSSForm = () => {
  state.rssForm.data.url = '';
};

const addFeed = (url) => {
  state.rssForm.state = 'pending';
  return validateRSSForm()
    .catch((error) => {
      state.rssForm.state = 'filling';
      throw error;
    })
    .then(() => {
      return axios // todo: cors
        .get(corsURL + url)
        .then((response) => {
          const feed = parseRSSXML(response.data);
          const channelId = _.uniqueId('channel-');
          const channel = { ...feed.channel, id: channelId, url };
          const posts = feed.posts.map((post) => ({ ...post, channelId }));
          state.channels = [channel, ...state.channels];
          state.posts = [...posts, ...state.posts];
          state.rssForm.state = 'succeeded';
          return channel;
        })
        .catch((error) => {
          state.rssForm.state = 'failed';
          throw error;
        });
    });
};

const watchChannel = (channel) => {
  setTimeout(() => {
    axios
      .get(corsURL + channel.url)
      .then((response) => {
        const feed = parseRSSXML(response.data);

        // todo: better name (recent?)
        const newFeedPosts = _.differenceBy(
          feed.posts,
          state.posts,
          (post) => channel.id + post.id,
        );

        if (newFeedPosts.length) {
          // ? should i think of a better solution for ids?
          const newPosts = newFeedPosts.map((post) => ({
            ...post,
            channelId: channel.id,
          }));
          state.posts = [...newPosts, ...state.posts];
        }
      })
      .catch(_.noop) // ? should i increase the wait time?
      .finally(() => watchChannel(channel));
  }, 5000); // ? is it a magic num?
};

// =====================================
//  MOUNTING
// =====================================

doc.rssForm.urlInput.oninput = (e) => updateRSSFormUrl(_.trim(e.target.value));
doc.rssForm.form.onsubmit = (e) => {
  e.preventDefault();
  addFeed(state.rssForm.data.url)
    .then((channel) => {
      resetRSSForm();
      watchChannel(channel);
    })
    .catch(_.noop);
};

insertTexts();
// validateRSSForm();
renderRSSForm(state.rssForm);
renderChannels(state.channels);
renderPosts(state.posts);
