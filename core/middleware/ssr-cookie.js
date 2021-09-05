import axios from 'axios';

// See more at: https://github.com/nuxt-community/express-template
export default function({isServer, req}) {
  if (isServer) {
    axios.defaults.headers.common.cookie = req.headers.cookie;
  }
}