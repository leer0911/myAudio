import './scss/index.scss';
import './iconfont';
import _ from './utils';
import defaultConfig from './config';

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
    this.timers = {};
    // 检查传入参数是否合法
    // --------------------------------------------------
    if (!_.is.htmlElement(this.media)) {
      this.error(
        '不是合法的 media 元素，请从第一个参数传入正确的 media 元素 !'
      );
      return;
    }

    // 检查浏览器版本及支持情况
    // --------------------------------------------------
    this.browser = _.browserSniff();
    this.supported = this.supported();
    this.log('[浏览器信息：]', this.browser, '[支持情况：]', this.supported);
    if (!this.supported.basic) {
      this.error('该浏览器不支持 Audio 元素，请换高版本浏览器');
      return;
    }

    this.init();
  }
  init() {
    if (this.isInit) {
      return null;
    }

    // 用于保存播放器状态
    // --------------------------------------------------
    if (this.config.storage.enabled) {
      this.setupStorage();
      this.log('[生命周期]', 'Storage 设置完成!');
    }

    // 在media外新建一层div
    // --------------------------------------------------
    this.container = _.wrap(this.media, document.createElement('div'));
    this.container.setAttribute('tabindex', 0);
    _.toggleClass(
      this.container,
      this.config.selectors.container.replace('.', ''),
      this.supported.full
    );

    // UI 构建
    // --------------------------------------------------
    this.setupMedia(); // 区分设备，添加相应类名
    this.setupInterface(); // DOM 构建
    this.log('[生命周期]', '界面 构建完成!');
    this.ready();

    // // Successful setup
    this.isInit = true;
  }
  supported() {
    let browser = this.browser;
    let isOldIE = browser.isIE && browser.version <= 9;
    let audioSupport = !!document.createElement('audio').canPlayType;
    return {
      basic: audioSupport,
      full: audioSupport && !isOldIE
    };
  }
  console(type, args) {
    if (this.config.debug && window.console) {
      args = Array.prototype.slice.call(args);
      if (_.is.string(this.config.logPrefix) && this.config.logPrefix.length) {
        args.unshift(this.config.logPrefix);
      }
      console[type].apply(console, args);
    }
  }
  log() {
    this.console('log', arguments);
  }
  warn() {
    this.console('warn', arguments);
  }
  error() {
    this.console('error', arguments);
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
         <button type="button" data-myaudio="pause">
          <svg><use xlink:href="#${icon.pause}" /></svg>
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
    _.on(this.media, 'timeupdate seeking', this.timeUpdate.bind(this));

    _.on(
      this.media,
      'durationchange loadedmetadata',
      this.displayDuration.bind(this)
    );

    _.on(this.media, 'progress playing', this.updateProgress.bind(this));

    _.on(this.media, 'volumechange', this.updateVolume.bind(this));

    _.on(this.media, 'play pause ended', this.checkPlaying.bind(this));

    _.on(this.media, 'waiting canplay seeked', this.checkLoading.bind(this));

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

    let displayHours = parseInt((this.getDuration() / 60 / 60) % 60) > 0;

    this.secs = ('0' + this.secs).slice(-2);
    this.mins = ('0' + this.mins).slice(-2);

    element.innerHTML =
      (displayHours ? this.hours + ':' : '') + this.mins + ':' + this.secs;
  }
  displayDuration() {
    if (!this.supported.full) {
      return;
    }

    let duration = this.getDuration() || 0;

    if (!this.duration && this.config.displayDuration && this.media.paused) {
      this.updateTimeDisplay(duration, this.currentTime);
    }

    if (this.duration) {
      this.updateTimeDisplay(duration, this.duration);
    }
  }
  checkLoading(event) {
    let loading = event.type === 'waiting';
    let _this = this;
    clearTimeout(this.timers.loading);

    this.timers.loading = setTimeout(function() {
      _.toggleClass(_this.container, _this.config.classes.loading, loading);
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
          value = this.getPercentage(this.media.currentTime, duration);

          if (event.type === 'timeupdate' && this.buttons.seek) {
            this.buttons.seek.value = value;
          }

          break;

        case 'playing':
        case 'progress':
          progress = this.progress.buffer;
          value = (() => {
            let buffered = this.media.buffered;

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
    let volume = this.media.muted
      ? 0
      : this.media.volume * this.config.volumeMax;

    if (!_.is.number(step)) {
      step = this.config.volumeStep;
    }

    this.setVolume(volume + step);
  }
  decreaseVolume(step) {
    let volume = this.media.muted
      ? 0
      : this.media.volume * this.config.volumeMax;

    if (!_.is.number(step)) {
      step = this.config.volumeStep;
    }

    this.setVolume(volume - step);
  }
  updateVolume() {
    let volume = this.media.muted
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
  setupStorage() {
    let value = null;
    this.storage = {};
    window.localStorage.removeItem('myaudio');
    value = window.localStorage.getItem(this.config.storage.key);
    if (!value) {
      return;
    }
    if (/^\d+(\.\d+)?$/.test(value)) {
      this.updateStorage({ volume: parseFloat(value) });
    } else {
      this.storage = JSON.parse(value);
    }
  }
  updateStorage(value) {
    _.extend(this.storage, value);
    window.localStorage.setItem(
      this.config.storage.key,
      JSON.stringify(this.storage)
    );
  }
  setupMedia() {
    if (this.supported.full) {
      _.toggleClass(
        this.container,
        this.config.classes.isIos,
        this.browser.isIos
      );

      _.toggleClass(
        this.container,
        this.config.classes.isTouch,
        this.browser.isTouch
      );
    }
  }
  event(element, type, bubbles, properties) {
    if (!element || !type) {
      return;
    }

    if (!_.is.boolean(bubbles)) {
      bubbles = false;
    }

    var event = new CustomEvent(type, {
      bubbles: bubbles,
      detail: properties
    });

    element.dispatchEvent(event);
  }
  triggerEvent(element, type, bubbles, properties) {
    this.event(
      element,
      type,
      bubbles,
      _.extend({}, properties, {
        myaudio: this
      })
    );
  }
  seek(input) {
    let targetTime = 0;
    let paused = this.media.paused;
    let duration = this.getDuration();

    if (_.is.number(input)) {
      targetTime = input;
    } else if (
      _.is.object(input) &&
      _.inArray(['input', 'change'], input.type)
    ) {
      targetTime = input.target.value / input.target.max * duration;
    }

    if (targetTime < 0) {
      targetTime = 0;
    } else if (targetTime > duration) {
      targetTime = duration;
    }

    this.updateSeekDisplay(targetTime);

    try {
      this.media.currentTime = targetTime.toFixed(4);
    } catch (e) {}

    if (paused) {
      this.pause();
    }

    this.triggerEvent(this.media, 'timeupdate');

    // this.media.seeking = true;

    this.triggerEvent(this.media, 'seeking');
  }
  controlListeners() {
    let _this = this;
    let inputEvent = this.browser.isIE ? 'change' : 'input';

    _.proxyListener(
      this.buttons.play,
      'click',
      this.config.listeners.play,
      this.togglePlay.bind(this)
    );
    _.proxyListener(
      this.buttons.pause,
      'click',
      this.config.listeners.pause,
      this.togglePlay.bind(this)
    );
    _.proxyListener(
      this.buttons.seek,
      inputEvent,
      this.config.listeners.seek,
      this.seek.bind(this)
    );
    _.proxyListener(
      this.volume.input,
      inputEvent,
      this.config.listeners.volume,
      () => {
        this.setVolume(_this.volume.input.value);
      }
    );
    _.proxyListener(
      this.buttons.mute,
      'click',
      this.config.listeners.mute,
      this.toggleMute.bind(this)
    );

    _.on(this.controls, 'mouseenter mouseleave', event => {
      this.controls.hover = event.type === 'mouseenter';
    });

    _.on(this.volume.input, 'wheel', event => {
      event.preventDefault();

      let inverted = event.webkitDirectionInvertedFromDevice;
      let step = this.config.volumeStep / 5;

      if (event.deltaY < 0 || event.deltaX > 0) {
        if (inverted) {
          this.decreaseVolume(step);
        } else {
          this.increaseVolume(step);
        }
      }

      if (event.deltaY > 0 || event.deltaX < 0) {
        if (inverted) {
          this.increaseVolume(step);
        } else {
          this.decreaseVolume(step);
        }
      }
    });
  }
  getElements(selector) {
    return this.container.querySelectorAll(selector);
  }
  getElement(selector) {
    return this.getElements(selector)[0];
  }
  findElements() {
    try {
      this.controls = this.getElement(this.config.selectors.controls.wrapper);

      this.buttons = {};
      this.buttons.seek = this.getElement(this.config.selectors.buttons.seek);
      this.buttons.play = this.getElement(this.config.selectors.buttons.play);
      this.buttons.pause = this.getElement(this.config.selectors.buttons.pause);

      // Inputs
      this.buttons.mute = this.getElement(this.config.selectors.buttons.mute);

      // Progress
      this.progress = {};
      this.progress.container = this.getElement(
        this.config.selectors.progress.container
      );

      // Progress - Buffering
      this.progress.buffer = {};
      this.progress.buffer.bar = this.getElement(
        this.config.selectors.progress.buffer
      );

      // Progress - Played
      this.progress.played = this.getElement(
        this.config.selectors.progress.played
      );

      // Volume
      this.volume = {};
      this.volume.input = this.getElement(this.config.selectors.volume.input);
      this.volume.display = this.getElement(
        this.config.selectors.volume.display
      );

      // Timing
      this.duration = this.getElement(this.config.selectors.duration);
      this.currentTime = this.getElement(this.config.selectors.currentTime);
      this.log('[生命周期]', 'DOM 引用完成!');
      return true;
    } catch (e) {
      this.warn('配置项中传入的控制器模板可能存在问题!');
      return false;
    }
  }
  setupInterface() {
    let controlsMissing = !this.getElements(
      this.config.selectors.controls.wrapper
    ).length;

    if (controlsMissing) {
      this.injectControls();
      this.log('[生命周期]', 'DOM 构建完成!');
    }

    if (!this.findElements()) {
      this.warn('模板存在问题，无法继续添加事件!');
      return;
    }

    if (controlsMissing) {
      this.controlListeners();
      this.log('[生命周期]', '控制器事件 添加完成!');
    }

    this.mediaListeners();
    this.log('[生命周期]', '音频原生事件 添加完成!');

    this.toggleNativeControls();
    this.setVolume();
    this.updateVolume();
    this.log('[生命周期]', '声音 设置完成!');

    this.timeUpdate();
    this.log('[生命周期]', '当前时间 设置完成!');

    this.checkPlaying();

    this.displayDuration();
    this.log('[生命周期]', '总时长 设置完成!');
  }
  toggleNativeControls(toggle) {
    if (toggle) {
      this.media.setAttribute('controls', '');
    } else {
      this.media.removeAttribute('controls');
    }
  }
  ready() {
    _.toggleClass(this.media, this.config.classes.setup, true);
    _.toggleClass(this.container, this.config.classes.ready, true);
    if (this.config.autoplay) {
      this.play();
    }
  }
}

window.MyAudio = MyAudio;
