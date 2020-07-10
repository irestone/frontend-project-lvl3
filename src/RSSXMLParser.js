import _ from 'lodash';

const getTextContent = (node, selector) => {
  return _.trim(node.querySelector(selector).textContent);
};

const parseRSSXML = (xml) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');

  const channel = {
    title: getTextContent(doc, 'channel > title'),
    description: getTextContent(doc, 'channel > description'),
    link: getTextContent(doc, 'channel > link'),
  };

  const posts = [...doc.querySelectorAll('item')].map((itemEl) => ({
    id: getTextContent(itemEl, 'guid'),
    title: getTextContent(itemEl, 'title'),
    description: getTextContent(itemEl, 'description'),
    link: getTextContent(itemEl, 'link'),
  }));

  return { channel, posts };
};

export default parseRSSXML;
