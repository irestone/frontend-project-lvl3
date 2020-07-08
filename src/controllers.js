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

const watchChannels = (state) => {
  const updateFrequency = 5000;
  setTimeout(() => {
    const updateRequests = state.channels
      .map((channel) => updateChannelPosts(state, channel));
    Promise.all(updateRequests)
      .finally(() => watchChannels(state, updateFrequency));
  }, updateFrequency);
};

// =====================================
//  HANDLERS
// =====================================

const handleRSSFormUpdate = (state, url) => {
  state.rssForm.url = url;

  if (!url) {
    state.rssForm.channelAddingProcess = { state: 'empty', errors: [] };
    return;
  }

  validateRSSForm(url, state.channels)
    .then(() => {
      state.rssForm.channelAddingProcess = { state: 'valid', errors: [] };
    })
    .catch(({ errors }) => {
      state.rssForm.channelAddingProcess = { state: 'invalid', errors };
    });
};

const handleChannelSubmission = (state) => {
  if (state.rssForm.channelAddingProcess.state !== 'valid') {
    return;
  }

  state.rssForm.channelAddingProcess = { state: 'sending', errors: [] };

  axios.get(makeCORSedUrl(state.rssForm.url))
    .then(({ data }) => {
      const feed = parseRSSXML(data);
      addFeed(state, feed, state.rssForm.url);
      state.rssForm.channelAddingProcess = { state: 'succeeded', errors: [] };
      state.rssForm.url = '';
    })
    .catch(() => {
      state.rssForm.channelAddingProcess = {
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
