import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';

import { parseRSSXML } from './parser';

const makeCORSedUrl = (url) => `https://cors-anywhere.herokuapp.com/${url}`;

// =====================================
//  RSS FORM
// =====================================

const validateRSSForm = (url, channels) => {
  // ? how to optimize this? (scheme creation)
  // ? can i pass the state (as a context) to .validate()?
  const rssFormURLSchema = yup
    .string()
    .required('rssForm.url.validationErrors.required')
    .url('rssForm.url.validationErrors.invalidUrl')
    .test(
      'is-unique-channel',
      'rssForm.url.validationErrors.notUnique',
      (url) => !channels.some((channel) => channel.url === url),
    );

  return rssFormURLSchema.validate(url);
};

const resetRSSForm = (state) => {
  state.rssForm.fillingState = { state: 'empty', errors: [], url: '' };
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
  if (!url) {
    state.rssForm.fillingState = { state: 'empty', errors: [], url };
    return;
  }

  validateRSSForm(url, state.channels)
    .then(() => {
      state.rssForm.fillingState = { state: 'valid', errors: [], url };
    })
    .catch(({ errors }) => {
      state.rssForm.fillingState = { state: 'invalid', errors, url };
    });
};

const handleChannelSubmission = (state) => {
  if (state.rssForm.fillingState.state !== 'valid') {
    return;
  }

  state.rssForm.submissionState = { state: 'sending', errors: [] };

  axios.get(makeCORSedUrl(state.rssForm.fillingState.url))
    .then(({ data }) => {
      const feed = parseRSSXML(data);
      addFeed(state, feed, state.rssForm.fillingState.url);
      resetRSSForm(state);
      state.rssForm.submissionState = { state: 'succeeded', errors: [] };
    })
    .catch(() => {
      state.rssForm.submissionState = {
        state: 'failed',
        errors: ['errors.unexpected'],
      };
    });
};

export {
  handleRSSFormUpdate,
  handleChannelSubmission,
  watchChannels,
};
