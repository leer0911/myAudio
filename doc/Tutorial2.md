# 教程系列之二

## 浏览器支持情况

为保证功能的正常，基本的浏览器检测是必要的。

* 浏览器是否支持 Audio 标签
* Audio 内置方法和属性在不同浏览器下表现不一致或未实现等情况，此时应该区分浏览器类型及版本。

另外兼容性这块推荐 [Modernizr](https://github.com/Modernizr/Modernizr)

## UI构建

* 生成播放器的 DOM 结构，并插入到文档树中。

使用数组来存储 DOM 结构，通过配置项选择性地往数组里 `push` 相应的 DOM，最终使用 `join` 导出 DOM 的字符串格式。通过 [insertAdjacentHTML](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/insertAdjacentHTML)把 DOM 插入文档树中。为方便以后 DOM 的操作和整体状态样式的控制，可以将控制器 DOM 结构跟 Audio 标签包裹在同一 DIV 中。

```javascript
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

html.push('</div>');

html.join('');
```

* 保存 DOM 引用

为方便 DOM 操作，可基于原生[querySelectorAll](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/querySelectorAll)查询播放器相关 DOM 并暂存起来，（如播放按钮，进度条，声音控制器等）。

## 控制器

控制器相关的事件有

* 播放按钮点击事件
* 进度条 seek 事件（ 由于使用的是 `input` ，故监听 `Change` 来更新进度条 ）
* 静音控制按钮的点击事件
* 音量控制的原理跟进度条类似

### 播放控制

播放和音量控制都涉及两种状态，可以使用 toggle 的方式来控制。

```javascript
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
```

### 进度条控制

进度条控制中 input change 触发的 seek 回调

```js

//
seek(input) {
  // 跳转时间
  let targetTime = 0;
  let paused = this.media.paused;
  // 获取总时长
  let duration = this.getDuration();

  if (_.is.number(input)) {
    // 如果传入的参数为数值则直接设置为目标时间
    targetTime = input;
  } else if (
    // 一般情况下，传入的参数为 input 元素，
    // 由于 targetTime / duration  = input.target.value / input.target.max
    // 所以跳转时间为 targetTime = input.target.value / input.target.max * duration;
    _.is.object(input) &&
    _.inArray(['input', 'change'], input.type)
  ) {
    targetTime = input.target.value / input.target.max * duration;
  }

  // 特殊情况处理
  // 让跳转时间的区间在 0 至 总时长
  if (targetTime < 0) {
    targetTime = 0;
  } else if (targetTime > duration) {
    targetTime = duration;
  }

  // 更新进度条
  this.updateSeekDisplay(targetTime);

  // 让Audio元素的当前时间等于跳转时间完成跳转
  // TODO：如果需求是拖动进度条过程不改变音频当前时间则需要做其他处理
  try {
    this.media.currentTime = targetTime.toFixed(4);
  } catch (e) {}

  // 确保音频暂停状态一致
  if (paused) {
    this.pause();
  }

  // 触发 audio 原生 timeupdate 和 seeking，目的是状态保持一致
  // 这里涉及 自定义事件 想深入的同学可自行了解
  this.triggerEvent(this.media, 'timeupdate');
  this.triggerEvent(this.media, 'seeking');
}
```

### 静音控制

同播放控制

### 音量设置

```javascript
  setVolume(volume) {
    let max = this.config.volumeMax;
    let min = this.config.volumeMin;

    // 取storage的值
    if (_.is.undefined(volume)) {
      volume = this.storage.volume;
    }

    // 取默认值
    if (volume === null || isNaN(volume)) {
      volume = this.config.volume;
    }

    // 控制音量区间在 min 至 max
    if (volume > max) {
      volume = max;
    }
    if (volume < min) {
      volume = min;
    }

    this.media.volume = parseFloat(volume / max);

    // 同步 音量的进度条
    if (this.volume.display) {
      this.volume.display.value = volume;
    }

    // 音量确定是否静音
    if (volume === 0) {
      this.media.muted = true;
    } else if (this.media.muted && volume > 0) {
      this.toggleMute();
    }
  }
```

## 媒体事件监听

### 获取时长

`durationchange` `loadedmetadata` 触发时，获取时长 或者 手动设置时长。

```javascript
  displayDuration() {
    // 支持ie9 以上
    if (!this.supported.full) {
      return;
    }

    // Audio 很多事件都基于 duration 正常获取，但是duration在每个设备中值可能不同
    // TODO：当需要懒加载时，音频不加载则无法获取时长，此时需手动设置
    let duration = this.getDuration() || 0;

    // 只在开始的时候显示时长，设置的条件是没有时长的DOM，displayDuration 为true，视频暂停时。
    if (!this.duration && this.config.displayDuration && this.media.paused) {
      this.updateTimeDisplay(duration, this.currentTime);
    }

    if (this.duration) {
      // 转换时间格式后，通过 innerHTML 直接设置
      this.updateTimeDisplay(duration, this.duration);
    }
  }
```

### 更新时间

`timeupdate` `seeking` 触发时，更新时间

```javascript
timeUpdate(event) {
  // 更新音频当前时间
  this.updateTimeDisplay(this.media.currentTime, this.currentTime);

  if (event && event.type === 'timeupdate' && this.media.seeking) {
    return;
  }
  // 更新进度条
  this.updateProgress(event);
}
```

### 更新进度条

`progress` `playing` 触发时，更新缓存时长

```javascript
updateProgress(event) {
    if (!this.supported.full) {
      return;
    }

    let progress = this.progress.played;
    let value = 0;
    let duration = this.getDuration();

    if (event) {
      switch (event.type) {
        // 已播放时长设置
        case 'timeupdate':
        case 'seeking':
          value = this.getPercentage(this.media.currentTime, duration);

          if (event.type === 'timeupdate' && this.buttons.seek) {
            this.buttons.seek.value = value;
          }

          break;
        // 缓存时长设置
        case 'playing':
        case 'progress':、
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
```

```javascript
  // 进度条有两种，1、已播放的 2、缓存
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
```

### 音量控制

`volumechange` 触发时，更新音量

```javascript
  updateVolume() {
    // 静音时，音量为0
    let volume = this.media.muted
      ? 0
      : this.media.volume * this.config.volumeMax;

    if (this.supported.full) {
      if (this.volume.input) {
        // 音频控制圆点位置更新
        this.volume.input.value = volume;
      }
      if (this.volume.display) {
        // 音量位置更新
        this.volume.display.value = volume;
      }
    }

    this.updateStorage({ volume: volume });

    // 添加静音全局样式控制类
    _.toggleClass(this.container, this.config.classes.muted, volume === 0);
  }
```

### 播放控制

`play` `pause` `ended` 触发时，更新播放状态

```javascript
  checkPlaying() {
    // 暂停和播放样式切换
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
```

### Loading

`waiting` `canplay` `seeked` 触发时，更新loading状态

```javascript
  checkLoading(event) {
    let loading = event.type === 'waiting';
    let _this = this;
    clearTimeout(this.timers.loading);

    // 当不是 waiting 事件时，把事件在当前调用栈最后执行
    this.timers.loading = setTimeout(function() {
      _.toggleClass(_this.container, _this.config.classes.loading, loading);
    }, loading ? 250 : 0);
  }
```

## 总结

audio 的事件并不多，DOM结构也并不复杂。只要大家按上面的思路理一遍，基本也能自己写一个原生的audio。

实现方式大同小异，只是需求不同。希望这个教程对大家有所帮助。接下来的教程系列将会从audio 中的遇到的坑来讲解。

谢谢阅读！

## 其他分享

以下推荐阅读，读者可选读：

* [如何用 vue 开发简易版流程图](https://github.com/leer0911/myVueTest) 附源码
* [如何提升码字效率](https://github.com/leer0911/myHotKey)
* [如何自动生成前端 API 文档](https://github.com/leer0911/myJsdoc)
* [如何配置标配的 webpack 工程化项目](https://github.com/leer0911/myAudio/blob/master/doc/webpack.md)