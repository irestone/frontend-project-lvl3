/* eslint no-param-reassign: 0 */

import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';

import parseRSSXML from './RSSXMLParser';

const makeCORSedUrl = (url) => `https://cors-anywhere.herokuapp.com/${url}`;

// =====================================
//  RSS FORM
// =====================================

const validateRSSForm = (rssUrl, channels) => {
  const rssFormURLSchema = yup
    .string()
    .required('rssForm.url.validationErrors.required')
    .url('rssForm.url.validationErrors.invalidUrl')
    .notOneOf(
      channels.map(({ url }) => url),
      'rssForm.url.validationErrors.notUnique',
    );

  return rssFormURLSchema.validate(rssUrl);
};

// =====================================
//  FEED
// =====================================

const addFeed = (state, feed, url) => {
  const channelId = _.uniqueId('channel-');
  const channel = { ...feed.channel, id: channelId, url };
  const posts = feed.posts.map((post) => ({ ...post, channelId }));
  state.channels.unshift(channel);
  state.posts.unshift(...posts);
};

const updateChannelPosts = (state, channel) => {
  return axios.get(makeCORSedUrl(channel.url))
    .then(({ data }) => {
      const feed = parseRSSXML(data);
      const channelPosts = _.filter(state.posts, { channelId: channel.id });
      const newPosts = _.differenceBy(feed.posts, channelPosts, 'id')
        .map((post) => ({ ...post, channelId: channel.id }));
      state.posts.unshift(...newPosts);
    });
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
  updateChannelPosts,
};
