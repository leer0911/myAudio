export default {
  controls: ['play', 'progress', 'current-time', 'duration', 'mute', 'volume'],
  icon: {
    play: 'icon-bofang',
    pause: 'icon-bofangzanting',
    muted: 'icon-jingyin',
    volume: 'icon-shengyin'
  },
  autoplay: false,
  volumeMin: 0,
  volumeMax: 10,
  volume: 10,
  html: '',
  logPrefix: '日志：',
  debug: true,
  disableContextMenu: true,
  classes: {
    setup: 'myaudio--setup',
    ready: 'myaudio--ready',
    stopped: 'myaudio--stopped',
    playing: 'myaudio--playing',
    muted: 'myaudio--muted',
    loading: 'myaudio--loading',
    hover: 'myaudio--hover',
    isIos: 'myaudio--is-ios',
    isTouch: 'myaudio--is-touch'
  },
  storage: {
    enabled: true,
    key: 'myaudio'
  },
  selectors: {
    container: '.myaudio',
    controls: {
      container: null,
      wrapper: '.myaudio__controls'
    },
    labels: '[data-myaudio]',
    buttons: {
      seek: '[data-myaudio="seek"]',
      play: '[data-myaudio="play"]',
      pause: '[data-myaudio="pause"]',
      mute: '[data-myaudio="mute"]'
    },
    volume: {
      input: '[data-myaudio="volume"]',
      display: '.myaudio__volume--display'
    },
    progress: {
      container: '.myaudio__progress',
      buffer: '.myaudio__progress--buffer',
      played: '.myaudio__progress--played'
    },
    currentTime: '.myaudio__time--current',
    duration: '.myaudio__time--duration'
  },
  listeners: {
    seek: null,
    play: null,
    pause: null,
    mute: null,
    volume: null
  }
};
