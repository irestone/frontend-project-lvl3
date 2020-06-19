import * as yup from 'yup';
import axios from 'axios';
import _ from 'lodash';

import { parseRSSXML } from './parser';

// ? better name?
const cors = (url) => `https://cors-anywhere.herokuapp.com/${url}`;

const fetchFeed = (url) => axios
  .get(cors(url))
  .then((response) => parseRSSXML(response.data));

// =====================================
//  RSS FORM
// =====================================

const validateRSSForm = (state) => {
  // ? how to optimize this? (scheme creation)
  // ? can i pass the state (as a context) to .validate()?
  const rssFormSchema = yup.object().shape({
    url: yup
      .string()
      .required('rssForm.url.validationErrors.required')
      .url('rssForm.url.validationErrors.invalidUrl')
      .test(
        'is-unique-channel',
        'rssForm.url.validationErrors.notUnique',
        (url) => !state.channels.some((channel) => channel.url === url),
      ),
  });

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

const updateRSSForm = (state, formData) => {
  state.rssForm.data = { ...state.rssForm.data, ...formData };
};

const resetRSSForm = (state) => {
  state.rssForm.data = { url: '' };
};

// =====================================
//  FEED
// =====================================

const addFeed = (state, feed, url) => {
  // ? is it ok how i handle this id assigning?
  const channelId = url;
  const channel = { ...feed.channel, id: channelId, url };
  const posts = feed.posts.map((post) => ({ ...post, channelId }));
  state.channels = [channel, ...state.channels];
  state.posts = [...posts, ...state.posts];
  return channelId;
};

const updateChannelPosts = (state, channel) => {
  return fetchFeed(channel.url)
    .then((feed) => {
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

// ? should i just periodically update the whole feed?
const watchChannel = (state, channelId, updateFrequency = 5000) => {
  const channel = state.channels.find((channel) => channel.id === channelId);

  if (!channel) {
    return;
  }

  const planUpdate = () => {
    setTimeout(() => {
      updateChannelPosts(state, channel).finally(planUpdate);
    }, updateFrequency);
  };

  planUpdate();
};

// =====================================
//  HANDLERS
// =====================================

const handleRSSFormUpdate = (state, formData) => {
  state.rssForm.state = 'filling';
  updateRSSForm(state, formData);
  validateRSSForm(state); // ? what should i do with errors?
};

const handleChannelSubmission = (state) => {
  state.rssForm.state = 'processing';
  validateRSSForm(state)
    .then(() => fetchFeed(state.rssForm.data.url))
    .then((feed) => addFeed(state, feed, state.rssForm.data.url))
    .then((channelId) => watchChannel(state, channelId))
    .then(() => resetRSSForm(state))
    .catch(() => {
      if (!state.rssForm.errors.length) {
        state.rssForm.errors = ['errors.unexpected'];
      }
    })
    .finally(() => {
      state.rssForm.state = 'processed';
      console.log(state.rssForm);
    });
};

export {
  handleRSSFormUpdate,
  handleChannelSubmission,
};
