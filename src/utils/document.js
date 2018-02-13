var topLevel =
  typeof global !== 'undefined'
    ? global
    : typeof window !== 'undefined' ? window : {};
var minDoc = require('min-document');

var doccy;

if (typeof document !== 'undefined') {
  doccy = document;
} else {
  doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];
}

module.exports = doccy;
