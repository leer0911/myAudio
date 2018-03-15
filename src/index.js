import './scss/index.scss';
import defaultConfig from './config';
import './iconfont';
import _ from './utils';

/**
 * @param media
 *
 * @class myAudio
 */
class MyAudio {
  constructor(media, config = {}) {
    this.config = Object.assign(defaultConfig, config);
    this.html = this.config.html;
    this.media = media;
    this.init();
  }
  init() {
    // 控制器 UI 搭建
    this.injectControls();
  }
  usrConsole(type, args) {
    if (this.config.debug && window.console) {
      args = Array.prototype.slice.call(args);
      if (_.is.string(this.config.logPrefix) && this.config.logPrefix.length) {
        args.unshift(this.config.logPrefix);
      }
      console[type].apply(console, args);
    }
  }
  log() {
    this.usrConsole('log', arguments);
  }
  warn() {
    this.usrConsole('warn', arguments);
  }
  buildControls() {
    let html = [];
    let config = this.config;
    let controls = config.controls;
    let icon = config.icon;

    html.push('<div class="myaudio__controls">');

    if (_.inArray(controls, 'play')) {
      html.push(
        `
         <button type="button" data-myaudio="play">
          <svg><use xlink:href="#${icon.play}" /></svg>
         </button>
        `
      );
    }

    if (_.inArray(controls, 'progress')) {
      html.push(
        `
          <span class="myaudio__progress">
            <input class="myaudio__progress--seek" type="range" min="0" max="100" step="0.1" value="0" data-myaudio="seek">
            <progress class="myaudio__progress--played" max="100" value="0" role="presentation"></progress>
            <progress class="myaudio__progress--buffer" max="100" value="0"></progress>
          </span>
        `
      );
    }

    if (_.inArray(controls, 'current-time')) {
      html.push(
        `
          <span class="myaudio__time">
            <span class="myaudio__time--current">00:00</span>
          </span>
        `
      );
    }

    if (_.inArray(controls, 'duration')) {
      html.push(
        `
          <span class="myaudio__time">
            <span class="myaudio__time--duration">00:00</span>
          </span>
        `
      );
    }

    if (_.inArray(controls, 'mute')) {
      html.push(
        `
          <button type="button" data-myaudio="mute">
            <svg class="icon--muted"><use xlink:href="#${icon.muted}"/></svg>
            <svg><use xlink:href="#${icon.volume}"/></svg>
          </button>
        `
      );
    }

    if (_.inArray(controls, 'volume')) {
      html.push(
        `
          <span class="myaudio__volume">
            <input class="myaudio__volume--input" type="range"
              min="${config.volumeMin}"
              max="${config.volumeMax}"
              value="${config.volume}" data-myaudio="volume">
            <progress class="myaudio__volume--display"
              max="${config.volumeMax}"
              value="${config.volumeMin}"
              role="presentation">
            </progress>
          </span>
        `
      );
    }

    html.push('</div>');

    return html.join('');
  }
  injectControls() {
    if (!this.html) {
      this.html = this.buildControls();
    }

    this.media.insertAdjacentHTML('beforeBegin', this.html);
  }
  updateSeekDisplay(time) {
    if (!_.is.number(time)) {
      time = 0;
    }

    let duration = this.getDuration();
    let value = this.getPercentage(time, duration);
    if (this.progress && this.progress.played) {
      this.progress.played.value = value;
    }

    if (this.buttons && this.buttons.seek) {
      this.buttons.seek.value = value;
    }
  }
  getPercentage(current, max) {
    if (current === 0 || max === 0 || isNaN(current) || isNaN(max)) {
      return 0;
    }
    return (current / max * 100).toFixed(2);
  }
  getDuration() {
    let duration = parseInt(this.config.duration);
    let mediaDuration = 0;

    if (this.media.duration !== null && !isNaN(this.media.duration)) {
      mediaDuration = this.media.duration;
    }

    return isNaN(duration) ? mediaDuration : duration;
  }
  play() {
    if ('play' in this.media) {
      this.media.play();
    }
  }
  pause() {
    if ('pause' in this.media) {
      this.media.pause();
    }
  }
  togglePlay(toggle) {
    if (!_.is.boolean(toggle)) {
      toggle = this.media.paused;
    }

    if (toggle) {
      this.play();
    } else {
      this.pause();
    }

    return toggle;
  }
  mediaListeners() {
    _.on(this.media, 'timeupdate seeking', this.timeUpdate);

    _.on(this.media, 'durationchange loadedmetadata', this.displayDuration);

    _.on(this.media, 'progress playing', this.updateProgress);

    _.on(this.media, 'volumechange', this.updateVolume);

    _.on(this.media, 'play pause ended', this.checkPlaying);

    _.on(this.media, 'waiting canplay seeked', this.checkLoading);

    if (this.config.disableContextMenu) {
      _.on(this.media, 'contextmenu', function(event) {
        event.preventDefault();
      });
    }
  }
  timeUpdate(event) {
    this.updateTimeDisplay(this.media.currentTime, this.currentTime);

    if (event && event.type === 'timeupdate' && this.media.seeking) {
      return;
    }

    this.updateProgress(event);
  }
  updateTimeDisplay(time, element) {
    if (!element) {
      return;
    }

    if (isNaN(time)) {
      time = 0;
    }

    this.secs = parseInt(time % 60);
    this.mins = parseInt((time / 60) % 60);
    this.hours = parseInt((time / 60 / 60) % 60);

    var displayHours = parseInt((this.getDuration() / 60 / 60) % 60) > 0;

    this.secs = ('0' + this.secs).slice(-2);
    this.mins = ('0' + this.mins).slice(-2);

    element.innerHTML =
      (displayHours ? this.hours + ':' : '') + this.mins + ':' + this.secs;
  }
  displayDuration() {
    if (!this.supported.full) {
      return;
    }

    var duration = this.getDuration() || 0;

    if (!this.duration && this.config.displayDuration && this.media.paused) {
      this.updateTimeDisplay(duration, this.currentTime);
    }

    if (this.duration) {
      this.updateTimeDisplay(duration, this.duration);
    }

    this.updateSeekTooltip();
  }
  checkLoading(event) {
    var loading = event.type === 'waiting';

    clearTimeout(this.timers.loading);

    this.timers.loading = setTimeout(function() {
      _.toggleClass(this.container, this.config.classes.loading, loading);
    }, loading ? 250 : 0);
  }
  updateProgress(event) {
    if (!this.supported.full) {
      return;
    }

    let progress = this.progress.played;
    let value = 0;
    let duration = this.getDuration();

    if (event) {
      switch (event.type) {
        case 'timeupdate':
        case 'seeking':
          if (this.controls.pressed) {
            return;
          }

          value = this.initgetPercentage(this.media.currentTime, duration);

          if (event.type === 'timeupdate' && this.buttons.seek) {
            this.buttons.seek.value = value;
          }

          break;

        case 'playing':
        case 'progress':
          progress = this.progress.buffer;
          value = (function() {
            var buffered = this.media.buffered;

            if (buffered && buffered.length) {
              return this.getPercentage(buffered.end(0), duration);
            } else if (_.is.number(buffered)) {
              return buffered * 100;
            }

            return 0;
          })();

          break;
      }
    }

    // Set values
    this.setProgress(progress, value);
  }
  setProgress(progress, value) {
    if (!this.supported.full) {
      return;
    }

    if (_.is.undefined(value)) {
      value = 0;
    }
    if (_.is.undefined(progress)) {
      if (this.progress && this.progress.buffer) {
        progress = this.progress.buffer;
      } else {
        return;
      }
    }

    if (_.is.htmlElement(progress)) {
      progress.value = value;
    } else if (progress) {
      if (progress.bar) {
        progress.bar.value = value;
      }
      if (progress.text) {
        progress.text.innerHTML = value;
      }
    }
  }
  checkPlaying() {
    _.toggleClass(
      this.container,
      this.config.classes.playing,
      !this.media.paused
    );
    _.toggleClass(
      this.container,
      this.config.classes.stopped,
      this.media.paused
    );
  }
  toggleMute(muted) {
    if (!_.is.boolean(muted)) {
      muted = !this.media.muted;
    }

    this.media.muted = muted;

    if (this.media.volume === 0) {
      this.setVolume(this.config.volume);
    }
  }
  setVolume(volume) {
    let max = this.config.volumeMax;
    let min = this.config.volumeMin;

    if (_.is.undefined(volume)) {
      volume = this.storage.volume;
    }

    if (volume === null || isNaN(volume)) {
      volume = this.config.volume;
    }

    if (volume > max) {
      volume = max;
    }
    if (volume < min) {
      volume = min;
    }

    this.media.volume = parseFloat(volume / max);

    if (this.volume.display) {
      this.volume.display.value = volume;
    }

    if (volume === 0) {
      this.media.muted = true;
    } else if (this.media.muted && volume > 0) {
      this.toggleMute();
    }
  }
  increaseVolume(step) {
    var volume = this.media.muted
      ? 0
      : this.media.volume * this.config.volumeMax;

    if (!_.is.number(step)) {
      step = this.config.volumeStep;
    }

    this.setVolume(volume + step);
  }
  decreaseVolume(step) {
    var volume = this.media.muted
      ? 0
      : this.media.volume * this.config.volumeMax;

    if (!_.is.number(step)) {
      step = this.config.volumeStep;
    }

    this.setVolume(volume - step);
  }
  updateVolume() {
    var volume = this.media.muted
      ? 0
      : this.media.volume * this.config.volumeMax;

    if (this.supported.full) {
      if (this.volume.input) {
        this.volume.input.value = volume;
      }
      if (this.volume.display) {
        this.volume.display.value = volume;
      }
    }

    this.updateStorage({ volume: volume });

    _.toggleClass(this.container, this.config.classes.muted, volume === 0);
  }
  updateStorage(value) {
    if (!this.config.storage.enabled) {
      return;
    }

    _.extend(this.storage, value);

    window.localStorage.setItem(
      this.config.storage.key,
      JSON.stringify(this.storage)
    );
  }
}

const myaudio = document.getElementById('myaudio');
const audio = new MyAudio(myaudio);
