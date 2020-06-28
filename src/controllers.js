import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';

import { parseRSSXML } from './parser';

const makeCORSedUrl = (url) => `https://cors-anywhere.herokuapp.com/${url}`;

// =====================================
//  RSS FORM
// =====================================

const validateRSSForm = (state) => {
  // ? how to optimize this? (scheme creation)
  // ? can i pass the state (as a context) to .validate()?
  const rssFormURLSchema = yup
    .string()
    .required('rssForm.url.validationErrors.required')
    .url('rssForm.url.validationErrors.invalidUrl')
    .test(
      'is-unique-channel',
      'rssForm.url.validationErrors.notUnique',
      (url) => !state.channels.some((channel) => channel.url === url),
    );

  return rssFormURLSchema
    .validate(state.rssForm.url)
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

const resetRSSForm = (state) => {
  state.rssForm.url = '';
};

// =====================================
//  FEED
// =====================================

const addFeed = (state, feed, url) => {
  const channelId = _.uniqueId('channel-');
  const channel = { ...feed.channel, id: channelId, url };
  const posts = feed.posts.map((post) => ({ ...post, channelId }));
  state.channels = [channel, ...state.channels];
  state.posts = [...posts, ...state.posts];
};

const updateChannelPosts = (state, channel) => {
  return axios.get(makeCORSedUrl(channel.url))
    .then(({ data }) => {
      const feed = parseRSSXML(data);

      const newPosts = _.differenceBy(
        feed.posts,
        state.posts,
        (post) => channel.id + post.id,
      );

      if (!newPosts.length) {
        return;
      }

      const newPostsWithChannelIds = newPosts.map((post) => ({
        ...post,
        channelId: channel.id,
      }));

      state.posts = [...newPostsWithChannelIds, ...state.posts];
    });
};

const watchChannels = (state, updateFrequency = 5000) => {
  const planUpdate = () => {
    setTimeout(() => {
      const updateRequests = state.channels
        .map((channel) => updateChannelPosts(state, channel));
      Promise.all(updateRequests).finally(planUpdate);
    }, updateFrequency);
  };

  planUpdate();
};

// =====================================
//  HANDLERS
// =====================================

const handleRSSFormUpdate = (state, url) => {
  state.rssForm.state = 'filling';
  state.rssForm.url = url;
  validateRSSForm(state);
};

const handleChannelSubmission = (state) => {
  state.rssForm.state = 'processing';
  validateRSSForm(state)
    .then(() => axios.get(makeCORSedUrl(state.rssForm.url)))
    .then(({ data }) => {
      const feed = parseRSSXML(data);
      addFeed(state, feed, state.rssForm.url);
      resetRSSForm(state);
    })
    .catch(() => {
      if (!state.rssForm.errors.length) {
        state.rssForm.errors = ['errors.unexpected'];
      }
    })
    .finally(() => {
      state.rssForm.state = 'processed';
    });
};

export {
  handleRSSFormUpdate,
  handleChannelSubmission,
  watchChannels,
};
