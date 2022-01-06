export default (val) => {
  return val.length ? val.charAt(0).toUpperCase() + val.slice(1) : '';
};
