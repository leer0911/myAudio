# myAudio

**js 实现原生 Audio 初探版**

基于 ES6+scss+webpack 开发的原生 JS 版 H5 `Audio` ，此次分享的目的是让前端对 H5 的 Audio 有更深的了解，同时对现代前端技术也有个大致的了解，最终可以基于 `vue` 或 `react` 开发一个 H5 版的 网易音乐，QQ 音乐...

> 由于工作中有音频方面的需求，所以该项目也是自己作为迭代的记录。意味着，这将是一个系列教程。

[预览地址](https://vuedeveloper.github.io/myaudio/)，访问可能会比较慢。

## 教程

实现原生音频无外乎两个部分

* [UI](#UI)
* [Event](#Event)

首先要先了解 `Aduio` 的属性和方法。

关于 Audio 元素的介绍，推荐 MDN

* [属性](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/audio)
* [方法](https://developer.mozilla.org/zh-CN/docs/Web/Guide/Events/Media_events)

### UI

首先原生 audio 元素是必不可少的，我们也可以直接添加 `controls` 属性来使用浏览器实现的 UI。

```html
<audio id="myaudio" src="/static/test.mp3" controls></audio>
```

基础的 DOM 结构应该包括：

* 播放按钮
* 进度条
* 声音控制
* 当前时间/总时长

总体结构建议使用语义化元素，样式类名命名参考`BEM`。音频建议考虑 `视觉障碍者` ，可引入 [无障碍](https://developer.mozilla.org/zh-CN/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_button_role)

这边简单讲一下`进度条`的实现。通过 `input` 类型中 `range` 和 `progress` 可以大大降低 DOM 结构复杂度及提高语义化。

其中涉及到改浏览器原生样式读者可自行谷歌。也可以参考本项目源码

```html
<div class="myaudio__controls">
    <button type="button" data-myaudio="play"></button>
    <span class="myaudio__progress">
        <input class="myaudio__progress--seek" type="range" min="0" max="100" step="0.1" value="0" data-myaudio="seek">
        <progress class="myaudio__progress--played" max="100" value="0" role="presentation"></progress>
        <progress class="myaudio__progress--buffer" max="100" value="20.43"></progress>
    </span>
    <span class="myaudio__time--current">00:00</span>
    <span class="myaudio__time--duration">00:20</span>

    <button type="button" data-myaudio="mute"></button>

    <span class="myaudio__volume">
        <input class="myaudio__volume--input" type="range" min="0" max="10" value="10" data-myaudio="volume">
        <progress class="myaudio__volume--display" max="10" value="10" role="presentation">
        </progress>
    </span>
</div>
```

### Event

事件与 DOM 元素密不可分，而音频主要分两个方向去监听事件。用户自定义的 DOM 元素事件监听，Audio 原生事件监听。涉及的知识点是 `addEventListenter` 和 `自定义事件`。

本次 Audio 插件基于 Es6 的 `class` 开发。最终可以直接通过 实例化来生成一个 `audio` 对象

我们先从配置文件来大致了解下开发一个 Audio 所用到的配置项。

```js
export default {
  // 配置对应功能
  controls: ['play', 'progress', 'current-time', 'duration', 'mute', 'volume'],

  // 基于iconfont，SVG版，如需替换图片，
  // 可直接导入自己的iconfont文件，修改对应图片类名即可
  icon: {
    play: 'icon-bofang',
    pause: 'icon-bofangzanting',
    muted: 'icon-jingyin',
    volume: 'icon-shengyin'
  },

  // 配置是否自动播放
  autoplay: false,

  // 声音控制相关
  volumeMin: 0,
  volumeMax: 10,
  volume: 10,

  // 播放器HTML结构
  html: '',

  // Debugger 相关
  logPrefix: '日志：',
  debug: true,

  // 整体思路是通过控制全局状态类名，来设置对应样式
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

  // 状态保存相关
  storage: {
    enabled: true,
    key: 'myaudio'
  },

  // 选择器相关
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

  // 主要功能涉及以下 5 个事件
  // 事件相关
  listeners: {
    seek: null,
    play: null,
    pause: null,
    mute: null,
    volume: null
  }
};
```

从配置文件可以大概了解总体思路。下次分享将从源码解析的角度进一步讲解 Audio 原生实现。

## 其他分享

以下推荐阅读，读者可选读：

* [如何用 vue 开发简易版流程图](https://github.com/leer0911/myVueTest) 附源码
* [如何提升码字效率](https://github.com/leer0911/myHotKey)
* [如何自动生成前端 API 文档](https://github.com/leer0911/myJsdoc)
* [如何配置标配的 webpack 工程化项目](https://github.com/leer0911/myAudio/blob/master/doc/webpack.md)

## 快速运行

在前端的世界里，所码即所得。当我想要了解一个项目的时候，我会直接运行看效果。

接下来，假设你已经具备一定的前端工程化开发经验。

```bash
cd ~/Desktop
git clone https://github.com/leer0911/myAudio.git
cd myAudio
npm i
npm run dev
```

## 参考

感谢 [plyr](https://plyr.io/#audio)，可以说本教程是对它的一次源码解析。
