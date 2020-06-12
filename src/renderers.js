import { i18next } from './i18n';

const doc = {
  rssForm: {
    form: document.getElementById('rss-form'),
    urlInput: document.getElementById('rss-form__url-input'),
    submitButton: document.getElementById('rss-form__submit-button'),
  },
  feedback: document.getElementById('feedback'),
  channels: document.getElementById('channels__list'),
  posts: document.getElementById('posts__list'),
};

// todo: render feedback

const renderRSSForm = ({
  state, isValid, errors, data,
}) => {
  doc.rssForm.urlInput.value = data.url; // fixme: remove the line on prod
  doc.rssForm.urlInput.focus();

  // fixme: uncomment block on prod
  // if (state === 'initial' || !isValid) {
  //   doc.rssForm.submitButton.setAttribute('disabled', true);
  // } else {
  //   doc.rssForm.submitButton.removeAttribute('disabled');
  // }

  if (state === 'pending') {
    doc.rssForm.urlInput.setAttribute('disabled', true);
    doc.rssForm.submitButton.setAttribute('disabled', true);
  } else {
    doc.rssForm.urlInput.removeAttribute('disabled');
    doc.rssForm.submitButton.removeAttribute('disabled');
  }

  // ? how to show invalid block
  // ? https://getbootstrap.com/docs/4.0/components/forms/#validation
  // something with form-control
  if (state === 'filling' && !isValid) {
    doc.rssForm.urlInput.classList.add('is-invalid');
    // todo: show errors
    doc.feedback.innerHTML = errors.map((error) => i18next.t(error)).join('<br>');
    // doc.feedback.classList.add('invalid-feedback');
  } else {
    doc.rssForm.urlInput.classList.remove('is-invalid');
    doc.feedback.innerHTML = '';
    // doc.feedback.classList.remove('invalid-feedback');
  }

  if (state === 'succeeded') {
    doc.feedback.innerHTML = i18next.t('rssForm.feedback.succeeded');
  }

  if (state === 'failed') {
    doc.feedback.innerHTML = i18next.t('rssForm.feedback.failed');
  }
};

const renderChannels = (state) => {
  const channelsHTML = state.map(({ title, description, link }) => [
    `<dt><a href="${link}">${title}</a></dt>`,
    `<dd>${description}</dd>`,
  ].join(''));
  doc.channels.innerHTML = channelsHTML.join('<hr>');
};

const renderPosts = (state) => {
  const postsHTML = state.map(({ title, description, link }) => [
    `<dt><a href="${link}">${title}</a></dt>`,
    `<dd>${description}</dd>`,
  ].join(''));
  doc.posts.innerHTML = postsHTML.join('<hr>');
};

export {
  doc,
  renderRSSForm,
  renderChannels,
  renderPosts,
};
