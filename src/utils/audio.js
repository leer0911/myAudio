function _browserSniff() {
  var ua = navigator.userAgent,
    name = navigator.appName,
    fullVersion = '' + parseFloat(navigator.appVersion),
    majorVersion = parseInt(navigator.appVersion, 10),
    nameOffset,
    verOffset,
    ix,
    isIE = false,
    isFirefox = false,
    isChrome = false,
    isSafari = false;

  if (
    navigator.appVersion.indexOf('Windows NT') !== -1 &&
    navigator.appVersion.indexOf('rv:11') !== -1
  ) {
    // MSIE 11
    isIE = true;
    name = 'IE';
    fullVersion = '11';
  } else if ((verOffset = ua.indexOf('MSIE')) !== -1) {
    // MSIE
    isIE = true;
    name = 'IE';
    fullVersion = ua.substring(verOffset + 5);
  } else if ((verOffset = ua.indexOf('Chrome')) !== -1) {
    // Chrome
    isChrome = true;
    name = 'Chrome';
    fullVersion = ua.substring(verOffset + 7);
  } else if ((verOffset = ua.indexOf('Safari')) !== -1) {
    // Safari
    isSafari = true;
    name = 'Safari';
    fullVersion = ua.substring(verOffset + 7);
    if ((verOffset = ua.indexOf('Version')) !== -1) {
      fullVersion = ua.substring(verOffset + 8);
    }
  } else if ((verOffset = ua.indexOf('Firefox')) !== -1) {
    // Firefox
    isFirefox = true;
    name = 'Firefox';
    fullVersion = ua.substring(verOffset + 8);
  } else if (
    (nameOffset = ua.lastIndexOf(' ') + 1) < (verOffset = ua.lastIndexOf('/'))
  ) {
    // In most other browsers, 'name/version' is at the end of userAgent
    name = ua.substring(nameOffset, verOffset);
    fullVersion = ua.substring(verOffset + 1);

    if (name.toLowerCase() === name.toUpperCase()) {
      name = navigator.appName;
    }
  }

  // Trim the fullVersion string at semicolon/space if present
  if ((ix = fullVersion.indexOf(';')) !== -1) {
    fullVersion = fullVersion.substring(0, ix);
  }
  if ((ix = fullVersion.indexOf(' ')) !== -1) {
    fullVersion = fullVersion.substring(0, ix);
  }

  // Get major version
  majorVersion = parseInt('' + fullVersion, 10);
  if (isNaN(majorVersion)) {
    fullVersion = '' + parseFloat(navigator.appVersion);
    majorVersion = parseInt(navigator.appVersion, 10);
  }

  // Return data
  return {
    name: name,
    version: majorVersion,
    isIE: isIE,
    isFirefox: isFirefox,
    isChrome: isChrome,
    isSafari: isSafari,
    isIos: /(iPad|iPhone|iPod)/g.test(navigator.platform),
    isIphone: /(iPhone|iPod)/g.test(navigator.userAgent),
    isTouch: 'ontouchstart' in document.documentElement
  };
}

function _supportMime(plyr, mimeType) {
  var media = plyr.media;

  if (plyr.type === 'video') {
    // Check type
    switch (mimeType) {
      case 'video/webm':
        return !!(
          media.canPlayType &&
          media
            .canPlayType('video/webm; codecs="vp8, vorbis"')
            .replace(/no/, '')
        );
      case 'video/mp4':
        return !!(
          media.canPlayType &&
          media
            .canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')
            .replace(/no/, '')
        );
      case 'video/ogg':
        return !!(
          media.canPlayType &&
          media.canPlayType('video/ogg; codecs="theora"').replace(/no/, '')
        );
    }
  } else if (plyr.type === 'audio') {
    // Check type
    switch (mimeType) {
      case 'audio/mpeg':
        return !!(
          media.canPlayType &&
          media.canPlayType('audio/mpeg;').replace(/no/, '')
        );
      case 'audio/ogg':
        return !!(
          media.canPlayType &&
          media.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, '')
        );
      case 'audio/wav':
        return !!(
          media.canPlayType &&
          media.canPlayType('audio/wav; codecs="1"').replace(/no/, '')
        );
    }
  }

  // If we got this far, we're stuffed
  return false;
}

function _injectScript(source) {
  if (document.querySelectorAll('script[src="' + source + '"]').length) {
    return;
  }

  var tag = document.createElement('script');
  tag.src = source;
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function _inArray(haystack, needle) {
  return Array.prototype.indexOf && haystack.indexOf(needle) !== -1;
}

function _replaceAll(string, find, replace) {
  return string.replace(
    new RegExp(find.replace(/([.*+?\^=!:${}()|\[\]\/\\])/g, '\\$1'), 'g'),
    replace
  );
}

function _wrap(elements, wrapper) {
  // Convert `elements` to an array, if necessary.
  if (!elements.length) {
    elements = [elements];
  }

  // Loops backwards to prevent having to clone the wrapper on the
  // first element (see `child` below).
  for (var i = elements.length - 1; i >= 0; i--) {
    var child = i > 0 ? wrapper.cloneNode(true) : wrapper;
    var element = elements[i];

    // Cache the current parent and sibling.
    var parent = element.parentNode;
    var sibling = element.nextSibling;

    // Wrap the element (is automatically removed from its current
    // parent).
    child.appendChild(element);

    // If the element had a sibling, insert the wrapper before
    // the sibling to maintain the HTML structure; otherwise, just
    // append it to the parent.
    if (sibling) {
      parent.insertBefore(child, sibling);
    } else {
      parent.appendChild(child);
    }

    return child;
  }
}

function _remove(element) {
  if (!element) {
    return;
  }
  element.parentNode.removeChild(element);
}

function _prependChild(parent, element) {
  parent.insertBefore(element, parent.firstChild);
}

function _setAttributes(element, attributes) {
  for (var key in attributes) {
    element.setAttribute(
      key,
      _is.boolean(attributes[key]) && attributes[key] ? '' : attributes[key]
    );
  }
}

function _insertElement(type, parent, attributes) {
  // Create a new <element>
  var element = document.createElement(type);

  // Set all passed attributes
  _setAttributes(element, attributes);

  // Inject the new element
  _prependChild(parent, element);
}

// Get a classname from selector
function _getClassname(selector) {
  return selector.replace('.', '');
}

// Toggle class on an element
function _toggleClass(element, className, state) {
  if (element) {
    if (element.classList) {
      element.classList[state ? 'add' : 'remove'](className);
    } else {
      var name = (' ' + element.className + ' ')
        .replace(/\s+/g, ' ')
        .replace(' ' + className + ' ', '');
      element.className = name + (state ? ' ' + className : '');
    }
  }
}

// Has class name
function _hasClass(element, className) {
  if (element) {
    if (element.classList) {
      return element.classList.contains(className);
    } else {
      return new RegExp('(\\s|^)' + className + '(\\s|$)').test(
        element.className
      );
    }
  }
  return false;
}

// Element matches selector
function _matches(element, selector) {
  var p = Element.prototype;

  var f =
    p.matches ||
    p.webkitMatchesSelector ||
    p.mozMatchesSelector ||
    p.msMatchesSelector ||
    function(s) {
      return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
    };

  return f.call(element, selector);
}

// Bind along with custom handler
function _proxyListener(
  element,
  eventName,
  userListener,
  defaultListener,
  useCapture
) {
  if (userListener) {
    // Register this before defaultListener
    _on(
      element,
      eventName,
      function(event) {
        userListener.apply(element, [event]);
      },
      useCapture
    );
  }
  _on(
    element,
    eventName,
    function(event) {
      defaultListener.apply(element, [event]);
    },
    useCapture
  );
}

// Toggle event listener
function _toggleListener(element, events, callback, toggle, useCapture) {
  var eventList = events.split(' ');

  // Whether the listener is a capturing listener or not
  // Default to false
  if (!_is.boolean(useCapture)) {
    useCapture = false;
  }

  // If a nodelist is passed, call itself on each node
  if (element instanceof NodeList) {
    for (var x = 0; x < element.length; x++) {
      if (element[x] instanceof Node) {
        _toggleListener(element[x], arguments[1], arguments[2], arguments[3]);
      }
    }
    return;
  }

  // If a single node is passed, bind the event listener
  for (var i = 0; i < eventList.length; i++) {
    element[toggle ? 'addEventListener' : 'removeEventListener'](
      eventList[i],
      callback,
      useCapture
    );
  }
}

// Bind event
function _on(element, events, callback, useCapture) {
  if (element) {
    _toggleListener(element, events, callback, true, useCapture);
  }
}

// Unbind event
function _off(element, events, callback, useCapture) {
  if (element) {
    _toggleListener(element, events, callback, false, useCapture);
  }
}

// Trigger event
function _event(element, type, bubbles, properties) {
  // Bail if no element
  if (!element || !type) {
    return;
  }

  // Default bubbles to false
  if (!_is.boolean(bubbles)) {
    bubbles = false;
  }

  // Create and dispatch the event
  var event = new CustomEvent(type, {
    bubbles: bubbles,
    detail: properties
  });

  // Dispatch the event
  element.dispatchEvent(event);
}

// Toggle aria-pressed state on a toggle button
// http://www.ssbbartgroup.com/blog/how-not-to-misuse-aria-states-properties-and-roles
function _toggleState(target, state) {
  // Bail if no target
  if (!target) {
    return;
  }

  // Get state
  state = _is.boolean(state) ? state : !target.getAttribute('aria-pressed');

  // Set the attribute on target
  target.setAttribute('aria-pressed', state);

  return state;
}

// Get percentage
function _getPercentage(current, max) {
  if (current === 0 || max === 0 || isNaN(current) || isNaN(max)) {
    return 0;
  }
  return (current / max * 100).toFixed(2);
}

// Deep extend/merge destination object with N more objects
// http://andrewdupont.net/2009/08/28/deep-extending-objects-in-javascript/
// Removed call to arguments.callee (used explicit function name instead)
function _extend() {
  // Get arguments
  var objects = arguments;

  // Bail if nothing to merge
  if (!objects.length) {
    return;
  }

  // Return first if specified but nothing to merge
  if (objects.length === 1) {
    return objects[0];
  }

  // First object is the destination
  var destination = Array.prototype.shift.call(objects),
    length = objects.length;

  // Loop through all objects to merge
  for (var i = 0; i < length; i++) {
    var source = objects[i];

    for (var property in source) {
      if (
        source[property] &&
        source[property].constructor &&
        source[property].constructor === Object
      ) {
        destination[property] = destination[property] || {};
        _extend(destination[property], source[property]);
      } else {
        destination[property] = source[property];
      }
    }
  }

  return destination;
}

// Check variable types
var _is = {
  object: function(input) {
    return input !== null && typeof input === 'object';
  },
  array: function(input) {
    return (
      input !== null &&
      (typeof input === 'object' && input.constructor === Array)
    );
  },
  number: function(input) {
    return (
      input !== null &&
      ((typeof input === 'number' && !isNaN(input - 0)) ||
        (typeof input === 'object' && input.constructor === Number))
    );
  },
  string: function(input) {
    return (
      input !== null &&
      (typeof input === 'string' ||
        (typeof input === 'object' && input.constructor === String))
    );
  },
  boolean: function(input) {
    return input !== null && typeof input === 'boolean';
  },
  nodeList: function(input) {
    return input !== null && input instanceof NodeList;
  },
  htmlElement: function(input) {
    return input !== null && input instanceof HTMLElement;
  },
  function: function(input) {
    return input !== null && typeof input === 'function';
  },
  undefined: function(input) {
    return input !== null && typeof input === 'undefined';
  }
};

// Parse YouTube ID from url
function _parseYouTubeId(url) {
  var regex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  return url.match(regex) ? RegExp.$2 : url;
}

// Parse Vimeo ID from url
function _parseVimeoId(url) {
  var regex = /^.*(vimeo.com\/|video\/)(\d+).*/;
  return url.match(regex) ? RegExp.$2 : url;
}

// Fullscreen API
function _fullscreen() {
  var fullscreen = {
      supportsFullScreen: false,
      isFullScreen: function() {
        return false;
      },
      requestFullScreen: function() {},
      cancelFullScreen: function() {},
      fullScreenEventName: '',
      element: null,
      prefix: ''
    },
    browserPrefixes = 'webkit o moz ms khtml'.split(' ');

  // Check for native support
  if (!_is.undefined(document.cancelFullScreen)) {
    fullscreen.supportsFullScreen = true;
  } else {
    // Check for fullscreen support by vendor prefix
    for (var i = 0, il = browserPrefixes.length; i < il; i++) {
      fullscreen.prefix = browserPrefixes[i];

      if (!_is.undefined(document[fullscreen.prefix + 'CancelFullScreen'])) {
        fullscreen.supportsFullScreen = true;
        break;
      } else if (
        !_is.undefined(document.msExitFullscreen) &&
        document.msFullscreenEnabled
      ) {
        // Special case for MS (when isn't it?)
        fullscreen.prefix = 'ms';
        fullscreen.supportsFullScreen = true;
        break;
      }
    }
  }

  // Update methods to do something useful
  if (fullscreen.supportsFullScreen) {
    // Yet again Microsoft awesomeness,
    // Sometimes the prefix is 'ms', sometimes 'MS' to keep you on your toes
    fullscreen.fullScreenEventName =
      fullscreen.prefix === 'ms'
        ? 'MSFullscreenChange'
        : fullscreen.prefix + 'fullscreenchange';

    fullscreen.isFullScreen = function(element) {
      if (_is.undefined(element)) {
        element = document.body;
      }
      switch (this.prefix) {
        case '':
          return document.fullscreenElement === element;
        case 'moz':
          return document.mozFullScreenElement === element;
        default:
          return document[this.prefix + 'FullscreenElement'] === element;
      }
    };
    fullscreen.requestFullScreen = function(element) {
      if (_is.undefined(element)) {
        element = document.body;
      }
      return this.prefix === ''
        ? element.requestFullScreen()
        : element[
            this.prefix +
              (this.prefix === 'ms' ? 'RequestFullscreen' : 'RequestFullScreen')
          ]();
    };
    fullscreen.cancelFullScreen = function() {
      return this.prefix === ''
        ? document.cancelFullScreen()
        : document[
            this.prefix +
              (this.prefix === 'ms' ? 'ExitFullscreen' : 'CancelFullScreen')
          ]();
    };
    fullscreen.element = function() {
      return this.prefix === ''
        ? document.fullscreenElement
        : document[this.prefix + 'FullscreenElement'];
    };
  }

  return fullscreen;
}

// Local storage
var _storage = {
  supported: (function() {
    // Try to use it (it might be disabled, e.g. user is in private/porn mode)
    // see: https://github.com/sampotts/plyr/issues/131
    try {
      // Add test item
      window.localStorage.setItem('___test', 'OK');

      // Get the test item
      var result = window.localStorage.getItem('___test');

      // Clean up
      window.localStorage.removeItem('___test');

      // Check if value matches
      return result === 'OK';
    } catch (e) {
      return false;
    }

    return false;
  })()
};
