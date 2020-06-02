// @ts-check

import Example from './Example';

export default () => {
  const element = document.querySelector('.feedback');
  const obj = new Example(element);
  obj.init();
};
