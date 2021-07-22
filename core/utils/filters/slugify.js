export default (val) => {
  // For more information, visit https://www.npmjs.com/package/slug
  const slug = require('slug')
  return slug(val)
}
