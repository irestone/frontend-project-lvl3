import { init, i18next } from './i18n';

// ? should i inject init and i18next?
const insertTexts = (doc) => {
  return init(i18next).then(() => {
    doc.pageTitle.innerText = i18next.t('pageTitle');
    doc.title.innerText = i18next.t('title');
    doc.lead.innerText = i18next.t('lead');
    doc.rssForm.urlInput.setAttribute(
      'placeholder',
      i18next.t('rssForm.url.placeholder'),
    );
    doc.rssForm.submitButton.innerText = i18next.t('rssForm.submit');
    doc.channels.title.innerText = i18next.t('channels.title');
    doc.posts.title.innerText = i18next.t('posts.title');
  });
};

const renderRSSForm = (doc, {
  state, isValid, errors, data,
}) => {
  doc.rssForm.urlInput.value = data.url;
  doc.rssForm.urlInput.focus();

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

const renderChannels = (doc, channelsState) => {
  const channelsHTML = channelsState.map(({ title, description, link }) => [
    `<dt><a href="${link}">${title}</a></dt>`,
    `<dd>${description}</dd>`,
  ].join(''));
  doc.channels.list.innerHTML = channelsHTML.length
    ? channelsHTML.join('<hr>')
    : `<p class="text-muted">${i18next.t('channels.noChannels')}</p>`;
};

const renderPosts = (doc, postsState) => {
  const postsHTML = postsState.map(({ title, description, link }) => [
    `<dt><a href="${link}">${title}</a></dt>`,
    `<dd>${description}</dd>`,
  ].join(''));
  doc.posts.list.innerHTML = postsHTML.length
    ? postsHTML.join('<hr>')
    : `<p class="text-muted">${i18next.t('posts.noPosts')}</p>`;
};

export {
  insertTexts, renderRSSForm, renderChannels, renderPosts,
};
