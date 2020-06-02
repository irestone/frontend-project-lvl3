// @ts-check

export default class Example {
  constructor(element) {
    this.element = element;
  }

  init() {
    console.log(this.element);
    this.element.textContent = 'hello, world!';
    console.log('ehu!');
  }
}
