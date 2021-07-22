export default (val) => {
  const moment = require('moment')
  return val ? moment(val).format('hh:mm') : ''
}
