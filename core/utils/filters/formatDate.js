export default (val, locale = 'vi') => {
  const moment = require('moment')
  moment.locale(locale)
  return moment(val).format('Do MMMM YYYY')
}
