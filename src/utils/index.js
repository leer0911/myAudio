const inArray = (arr, ele) => {
  return Array.prototype.indexOf && arr.indexOf(ele) !== -1;
};

export default {
  inArray
};
