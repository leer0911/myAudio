export default {
  controls: ['play', 'progress', 'current-time', 'duration', 'mute', 'volume'],
  icon: {
    play: 'icon-bofang',
    pause: 'icon-bofangzanting',
    muted: 'icon-jingyin',
    volume: 'icon-shengyin'
  },
  volumeMin: 0,
  volumeMax: 10,
  volume: 10,
  html: '',
  logPrefix: 'MyAudio-Log:',
  debug: true,
  disableContextMenu: true,
  classes: {
    loading: 'myaudio--loading',
    stopped: 'myaudio--stopped',
    playing: 'myaudio--playing'
  }
};
