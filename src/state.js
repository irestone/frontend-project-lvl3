import onChange from 'on-change';

const init = (watcher) => onChange({
  rssForm: {
    // ? should i use an fsm?
    // ? should i use a map or smth to get rid of strings?
    state: 'filling', // filling | processing | processed
    isValid: true,
    errors: [],
    data: {
      url: '',
    },
  },
  channels: [],
  posts: [],
}, watcher);

export { init };
