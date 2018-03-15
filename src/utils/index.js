const inArray = (arr, ele) => {
  return Array.prototype.indexOf && arr.indexOf(ele) !== -1;
};

const toggleListener = (element, events, callback, toggle, useCapture) => {
  var eventList = events.split(' ');

  if (!is.boolean(useCapture)) {
    useCapture = false;
  }

  if (element instanceof NodeList) {
    for (var x = 0; x < element.length; x++) {
      if (element[x] instanceof Node) {
        toggleListener(element[x], arguments[1], arguments[2], arguments[3]);
      }
    }
    return;
  }

  for (var i = 0; i < eventList.length; i++) {
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

const toggleClass = (element, className, state) => {
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
};

const extend = () => {
  var objects = arguments;

  if (!objects.length) {
    return;
  }

  if (objects.length === 1) {
    return objects[0];
  }

  let destination = Array.prototype.shift.call(objects);
  let length = objects.length;

  for (var i = 0; i < length; i++) {
    var source = objects[i];

    for (var property in source) {
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

export default {
  inArray,
  is,
  on,
  off,
  toggleClass,
  extend
};
