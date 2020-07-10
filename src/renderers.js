/* eslint no-param-reassign: 0 */

import i18next from 'i18next';

// =====================================
//  TEXTS
// =====================================

const insertTexts = (documentElements) => {
  documentElements.pageTitle.innerText = i18next.t('pageTitle');
  documentElements.title.innerText = i18next.t('title');
  documentElements.lead.innerText = i18next.t('lead');
  documentElements.rssForm.urlInput.setAttribute(
    'placeholder',
    i18next.t('rssForm.url.placeholder'),
  );
  documentElements.rssForm.submitButton.innerText = i18next.t('rssForm.submit');
  documentElements.channels.title.innerText = i18next.t('channels.title');
  documentElements.posts.title.innerText = i18next.t('posts.title');
};

// =====================================
//  RSS FORM
// =====================================

const renderRSSFormErrors = (documentElements, errors) => {
  documentElements.feedback.innerHTML = errors.map((error) => {
    return `<small class="text-danger">${i18next.t(error)}</small>`;
  }).join('<br>');
};

const renderRSSFormMapping = {
  empty: (documentElements) => {
    documentElements.rssForm.submitButton.setAttribute('disabled', true);
  },
  invalid: (documentElements, { errors }) => {
    documentElements.rssForm.urlInput.classList.add('is-invalid');
    documentElements.rssForm.submitButton.setAttribute('disabled', true);
    renderRSSFormErrors(documentElements, errors);
  },
  valid: () => { },
  sending: (documentElements) => {
    documentElements.rssForm.urlInput.setAttribute('disabled', true);
    documentElements.rssForm.submitButton.setAttribute('disabled', true);
  },
  succeeded: (documentElements) => {
    documentElements.feedback.innerHTML = `<p class="text-success mt-3">${i18next.t('rssForm.success')}</>`;
  },
  failed: (documentElements, { errors }) => {
    renderRSSFormErrors(documentElements, errors);
  },
};

const renderRSSForm = (documentElements, channelAddingProcess) => {
  // reset
  documentElements.rssForm.submitButton.removeAttribute('disabled');
  documentElements.rssForm.urlInput.removeAttribute('disabled');
  documentElements.rssForm.urlInput.classList.remove('is-invalid');
  documentElements.feedback.innerHTML = '';

  const render = renderRSSFormMapping[channelAddingProcess.state];
  render(documentElements, channelAddingProcess);
};

const renderRSSFormURLInputValue = (documentElements, url) => {
  documentElements.rssForm.urlInput.value = url;
};

// =====================================
//  FEED
// =====================================

const genHTMLLinkList = (list) => {
  if (!list.length) {
    return '';
  }
  const rows = list.map(({ title, description, link }) => [
    `<dt><a href="${link}">${title}</a></dt>`,
    `<dd>${description}</dd>`,
  ].join(''));
  return `<dl>${rows.join('<hr>')}</dl>`;
};

const renderChannels = (documentElements, channelsState) => {
  documentElements.channels.list.innerHTML = channelsState.length
    ? genHTMLLinkList(channelsState)
    : `<p class="text-muted">${i18next.t('channels.noChannels')}</p>`;
};

const renderPosts = (documentElements, postsState) => {
  documentElements.posts.list.innerHTML = postsState.length
    ? genHTMLLinkList(postsState)
    : `<p class="text-muted">${i18next.t('posts.noPosts')}</p>`;
};

export {
  insertTexts, renderRSSForm, renderRSSFormURLInputValue, renderChannels, renderPosts,
};
