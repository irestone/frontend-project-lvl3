import i18next from 'i18next';

// =====================================
//  TEXTS
// =====================================

const insertTexts = (doc) => {
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
};

// =====================================
//  RSS FORM
// =====================================

const renderRSSFormMapping = {
  empty: (doc) => {
    doc.rssForm.submitButton.setAttribute('disabled', true);
  },
  invalid: (doc, { errors }) => {
    doc.rssForm.urlInput.classList.add('is-invalid');
    doc.rssForm.submitButton.setAttribute('disabled', true);
    doc.feedback.innerHTML = errors.map((error) => {
      return `<small class="text-danger">${i18next.t(error)}</small>`;
    }).join('<br>');
  },
  valid: () => { },
  sending: (doc) => {
    doc.rssForm.urlInput.setAttribute('disabled', true);
    doc.rssForm.submitButton.setAttribute('disabled', true);
  },
  succeeded: (doc) => {
    doc.feedback.innerHTML = `<p class="text-success mt-3">${i18next.t('rssForm.success')}</>`;
  },
  failed: (doc, { errors }) => {
    doc.feedback.innerHTML = errors.map((error) => {
      return `<small class="text-danger">${i18next.t(error)}</small>`;
    }).join('<br>');
  },
};

const renderRSSForm = (doc, channelAddingProcess) => {
  // reset
  doc.rssForm.submitButton.removeAttribute('disabled');
  doc.rssForm.urlInput.removeAttribute('disabled');
  doc.rssForm.urlInput.classList.remove('is-invalid');
  doc.feedback.innerHTML = '';

  const render = renderRSSFormMapping[channelAddingProcess.state];
  render(doc, channelAddingProcess);
};

const renderRSSFormURLInputValue = (doc, url) => {
  doc.rssForm.urlInput.value = url;
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

const renderChannels = (doc, channelsState) => {
  doc.channels.list.innerHTML = channelsState.length
    ? genHTMLLinkList(channelsState)
    : `<p class="text-muted">${i18next.t('channels.noChannels')}</p>`;
};

const renderPosts = (doc, postsState) => {
  doc.posts.list.innerHTML = postsState.length
    ? genHTMLLinkList(postsState)
    : `<p class="text-muted">${i18next.t('posts.noPosts')}</p>`;
};

export {
  insertTexts, renderRSSForm, renderRSSFormURLInputValue, renderChannels, renderPosts,
};
