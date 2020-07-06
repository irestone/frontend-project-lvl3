import {
  renderRSSFormFilling, renderRSSFormSubmission, renderChannels, renderPosts, insertTexts,
} from './renderers';

const renderersMapping = {
  'rssForm.fillingState': renderRSSFormFilling,
  'rssForm.submissionState': renderRSSFormSubmission,
  channels: renderChannels,
  posts: renderPosts,
};

const createWatcher = (doc) => (path, value) => {
  const render = renderersMapping[path];
  if (render) {
    render(doc, value);
  }
};

const initRender = (doc, state) => {
  insertTexts(doc);
  renderRSSFormFilling(doc, state.rssForm.fillingState);
  renderChannels(doc, state.channels);
  renderPosts(doc, state.posts);
};

export {
  createWatcher,
  initRender,
};
