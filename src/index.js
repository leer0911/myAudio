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
}

const myaudio = document.getElementById('myaudio');
const audio = new MyAudio(myaudio);
