const inArray = (arr, ele) => {
  return Array.prototype.indexOf && arr.indexOf(ele) !== -1;
};

const wrap = (elements, wrapper) => {
  if (!elements.length) {
    elements = [elements];
  }
  for (let i = elements.length - 1; i >= 0; i--) {
    let child = i > 0 ? wrapper.cloneNode(true) : wrapper;
    let element = elements[i];
    let parent = element.parentNode;
    let sibling = element.nextSibling;
    child.appendChild(element);
    if (sibling) {
      parent.insertBefore(child, sibling);
    } else {
      parent.appendChild(child);
    }
    return child;
  }
};

const toggleListener = (element, events, callback, toggle, useCapture) => {
  let eventList = events.split(' ');

  if (!is.boolean(useCapture)) {
    useCapture = false;
  }

  if (element instanceof NodeList) {
    for (let x = 0; x < element.length; x++) {
      if (element[x] instanceof Node) {
        toggleListener(element[x], arguments[1], arguments[2], arguments[3]);
      }
    }
    return;
  }
  for (let i = 0; i < eventList.length; i++) {
    element[toggle ? 'addEventListener' : 'removeEventListener'](
      eventList[i],
      callback,
      useCapture
    );
  }
};

const on = (element, events, callback, useCapture) => {
  if (element) {
    toggleListener(element, events, callback, true, useCapture);
  }
};

const off = (element, events, callback, useCapture) => {
  if (element) {
    toggleListener(element, events, callback, false, useCapture);
  }
};

const proxyListener = (
  element,
  eventName,
  userListener,
  defaultListener,
  useCapture
) => {
  if (userListener) {
    on(
      element,
      eventName,
      function(event) {
        userListener.apply(element, [event]);
      },
      useCapture
    );
  }
  on(
    element,
    eventName,
    function(event) {
      defaultListener.apply(element, [event]);
    },
    useCapture
  );
};

const toggleClass = (element, className, state) => {
  if (element) {
    if (element.classList) {
      element.classList[state ? 'add' : 'remove'](className);
    } else {
      let name = (' ' + element.className + ' ')
        .replace(/\s+/g, ' ')
        .replace(' ' + className + ' ', '');
      element.className = name + (state ? ' ' + className : '');
    }
  }
};

const extend = () => {
  let objects = arguments;

  if (!objects.length) {
    return;
  }

  if (objects.length === 1) {
    return objects[0];
  }

  let destination = Array.prototype.shift.call(objects);
  let length = objects.length;

  for (let i = 0; i < length; i++) {
    let source = objects[i];

    for (let property in source) {
      if (
        source[property] &&
        source[property].constructor &&
        source[property].constructor === Object
      ) {
        destination[property] = destination[property] || {};
        extend(destination[property], source[property]);
      } else {
        destination[property] = source[property];
      }
    }
  }

  return destination;
};

const is = {
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

const browserSniff = () => {
  let ua = navigator.userAgent;
  let name = navigator.appName;
  let fullVersion = '' + parseFloat(navigator.appVersion);
  let majorVersion = parseInt(navigator.appVersion, 10);
  let nameOffset;
  let verOffset;
  let ix;
  let isIE = false;
  let isFirefox = false;
  let isChrome = false;
  let isSafari = false;

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
    name = ua.substring(nameOffset, verOffset);
    fullVersion = ua.substring(verOffset + 1);

    if (name.toLowerCase() === name.toUpperCase()) {
      name = navigator.appName;
    }
  }

  if ((ix = fullVersion.indexOf(';')) !== -1) {
    fullVersion = fullVersion.substring(0, ix);
  }
  if ((ix = fullVersion.indexOf(' ')) !== -1) {
    fullVersion = fullVersion.substring(0, ix);
  }

  majorVersion = parseInt('' + fullVersion, 10);
  if (isNaN(majorVersion)) {
    fullVersion = '' + parseFloat(navigator.appVersion);
    majorVersion = parseInt(navigator.appVersion, 10);
  }

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
};

export default {
  inArray,
  is,
  on,
  off,
  toggleClass,
  extend,
  proxyListener,
  browserSniff,
  wrap
};
