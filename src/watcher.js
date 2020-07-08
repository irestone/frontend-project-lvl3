import {
  renderRSSForm, renderRSSFormURLInputValue, renderChannels, renderPosts, insertTexts,
} from './renderers';

const renderersMapping = {
  'rssForm.channelAddingProcess': renderRSSForm,
  'rssForm.url': renderRSSFormURLInputValue,
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
  renderRSSForm(doc, state.rssForm.channelAddingProcess);
  renderRSSFormURLInputValue(doc, state.rssForm.url);
  renderChannels(doc, state.channels);
  renderPosts(doc, state.posts);
};

export {
  createWatcher,
  initRender,
};
