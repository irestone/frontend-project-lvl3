const insertTexts = (doc, initi18next, i18next) => {
  return initi18next().then(() => {
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

// ? Resets are duiplicating. Do i have to do smth w/ that?

const renderRSSFormFilling = (doc, { state, errors, url }, i18next) => {
  doc.rssForm.urlInput.value = url;

  // reset
  doc.rssForm.submitButton.removeAttribute('disabled');
  doc.rssForm.urlInput.removeAttribute('disabled');
  doc.rssForm.urlInput.classList.remove('is-invalid');
  doc.feedback.innerHTML = '';


  if (state === 'invalid' || state === 'empty') {
    doc.rssForm.submitButton.setAttribute('disabled', true);
  }

  if (state === 'invalid') {
    doc.rssForm.urlInput.classList.add('is-invalid');
    doc.feedback.innerHTML = errors.map((error) => {
      return `<small class="text-danger">${i18next.t(error)}</small>`;
    }).join('<br>');
  }
};

const renderRSSFormSubmission = (doc, { state, errors }, i18next) => {
  // reset
  doc.rssForm.submitButton.removeAttribute('disabled');
  doc.rssForm.urlInput.removeAttribute('disabled');
  doc.rssForm.urlInput.classList.remove('is-invalid');
  doc.feedback.innerHTML = '';

  // ? dispatcher (map)
  if (state === 'sending') {
    doc.rssForm.urlInput.setAttribute('disabled', true);
    doc.rssForm.submitButton.setAttribute('disabled', true);
  } else if (state === 'succeeded') {
    doc.feedback.innerHTML = `<p class="text-success mt-3">${i18next.t('rssForm.success')}</>`;
  } else if (state === 'failed') {
    doc.feedback.innerHTML = errors.map((error) => {
      return `<small class="text-danger">${i18next.t(error)}</small>`;
    }).join('<br>');
  }
};

const renderChannels = (doc, channelsState, i18next) => {
  const channelsHTML = channelsState.map(({ title, description, link }) => [
    `<dt><a href="${link}">${title}</a></dt>`,
    `<dd>${description}</dd>`,
  ].join(''));
  doc.channels.list.innerHTML = channelsHTML.length
    ? channelsHTML.join('<hr>')
    : `<p class="text-muted">${i18next.t('channels.noChannels')}</p>`;
};

const renderPosts = (doc, postsState, i18next) => {
  const postsHTML = postsState.map(({ title, description, link }) => [
    `<dt><a href="${link}">${title}</a></dt>`,
    `<dd>${description}</dd>`,
  ].join(''));
  doc.posts.list.innerHTML = postsHTML.length
    ? postsHTML.join('<hr>')
    : `<p class="text-muted">${i18next.t('posts.noPosts')}</p>`;
};

export {
  insertTexts, renderRSSFormFilling, renderRSSFormSubmission, renderChannels, renderPosts,
};
