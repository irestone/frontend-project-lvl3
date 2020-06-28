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

const renderRSSForm = (doc, {
  state, isValid, errors, url,
}, i18next) => {
  doc.rssForm.urlInput.value = url;
  doc.rssForm.urlInput.focus();

  // reset

  doc.rssForm.submitButton.removeAttribute('disabled');
  doc.rssForm.urlInput.removeAttribute('disabled');
  doc.rssForm.urlInput.classList.remove('is-invalid');
  doc.feedback.innerHTML = '';

  // set
  // ? dispatcher

  if (state === 'filling') {
    if (!url || !isValid) {
      doc.rssForm.submitButton.setAttribute('disabled', true);
    }

    // todo: color feedback depending on the state
    // https://getbootstrap.com/docs/4.0/components/forms/#validation
    if (url && !isValid) {
      doc.rssForm.urlInput.classList.add('is-invalid');
      doc.feedback.innerHTML = errors.map((error) => {
        return `<small class="text-danger">${i18next.t(error)}</small>`;
      }).join('<br>');
    }
    return;
  }

  if (state === 'processing') {
    doc.rssForm.urlInput.setAttribute('disabled', true);
    doc.rssForm.submitButton.setAttribute('disabled', true);
    return;
  }

  if (state === 'processed') {
    if (errors.length) {
      doc.feedback.innerHTML = `<p class="text-danger mt-3">${i18next.t('rssForm.feedback.failed')}</>`;
    } else {
      doc.feedback.innerHTML = `<p class="text-success mt-3">${i18next.t('rssForm.feedback.succeeded')}</>`;
    }
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
  insertTexts, renderRSSForm, renderChannels, renderPosts,
};
