import { init, i18next } from './i18n';

const getEl = (id) => document.getElementById(id);

const doc = {
  rssForm: {
    form: getEl('rss-form'),
    urlInput: getEl('rss-form__url-input'),
    submitButton: getEl('rss-form__submit-button'),
  },
  feedback: getEl('feedback'),
  channels: getEl('channels__list'),
  posts: getEl('posts__list'),
};

const insertTexts = () => {
  return init(i18next).then(() => {
    getEl('page-title').innerText = i18next.t('pageTitle');
    getEl('title').innerText = i18next.t('title');
    getEl('lead').innerText = i18next.t('lead');
    getEl('rss-form__url-input').setAttribute(
      'placeholder',
      i18next.t('rssForm.url.placeholder'),
    );
    getEl('rss-form__submit-button').innerText = i18next.t('rssForm.submit');
    getEl('channels__title').innerText = i18next.t('channels.title');
    getEl('posts__title').innerText = i18next.t('posts.title');
  });
};

const renderRSSForm = ({
  state, isValid, errors, data,
}) => {
  doc.rssForm.urlInput.value = data.url;
  doc.rssForm.urlInput.focus();

  // ? how do i handle rendering?
  // ? should i redraw the whole form?

  if (state === 'initial' || !isValid) {
    doc.rssForm.submitButton.setAttribute('disabled', true);
  } else {
    doc.rssForm.submitButton.removeAttribute('disabled');
  }

  if (state === 'pending') {
    doc.rssForm.urlInput.setAttribute('disabled', true);
    doc.rssForm.submitButton.setAttribute('disabled', true);
  } else {
    // ! this is wrong. the whole approach. it overwrites previous rules
    doc.rssForm.urlInput.removeAttribute('disabled');
    doc.rssForm.submitButton.removeAttribute('disabled');
  }

  // todo: color feedback depending on the state
  // https://getbootstrap.com/docs/4.0/components/forms/#validation
  if (state === 'filling' && !isValid) {
    doc.rssForm.urlInput.classList.add('is-invalid');
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

const renderChannels = (channelsState) => {
  const channelsHTML = channelsState.map(({ title, description, link }) => [
    `<dt><a href="${link}">${title}</a></dt>`,
    `<dd>${description}</dd>`,
  ].join(''));
  doc.channels.innerHTML = channelsHTML.join('<hr>');
};

const renderPosts = (postsState) => {
  const postsHTML = postsState.map(({ title, description, link }) => [
    `<dt><a href="${link}">${title}</a></dt>`,
    `<dd>${description}</dd>`,
  ].join(''));
  doc.posts.innerHTML = postsHTML.join('<hr>');
};

export {
  doc, insertTexts, renderRSSForm, renderChannels, renderPosts,
};
