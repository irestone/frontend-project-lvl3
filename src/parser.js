import _ from 'lodash';

const parseRSSXML = (xml) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');

  const channel = {
    title: _.trim(doc.querySelector('channel > title').textContent),
    description: _.trim(doc.querySelector('channel > description').textContent),
    link: _.trim(doc.querySelector('channel > link').textContent),
  };

  const posts = [...doc.querySelectorAll('item')].map((itemEl) => ({
    id: _.trim(itemEl.querySelector('guid').textContent),
    title: _.trim(itemEl.querySelector('title').textContent),
    description: _.trim(itemEl.querySelector('description').textContent),
    link: _.trim(itemEl.querySelector('link').textContent),
  }));

  return { channel, posts };
};

export { parseRSSXML };
