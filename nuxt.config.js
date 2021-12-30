import fs from 'fs';
import YAML from 'yaml';
import webpack from 'webpack';

require('dotenv').config();

function readYamlFile(filePath) {
  const file = fs.readFileSync(filePath, 'utf8');

  return YAML.parse(file);
}

export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'nuxt-template',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: '/icons/style.css' },
    ],
  },

  dir: {
    layouts: 'core/layouts',
    middleware: 'core/middleware',
  },

  layoutTransition: {
    // Is "layout" by default
    name: 'fade',
    mode: 'out-in',
  },
  pageTransition: {
    // Is "page" by default
    name: 'slide-fade',
    mode: 'out-in',
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['@/core/styles/css/all.css', '@/core/styles/scss/all.scss'],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '@/core/plugins/v-sanitize' },
    { src: '@/core/plugins/element-ui' },
    { src: '@/core/plugins/moment' },
    { src: '@/core/plugins/axios' },
    { src: '@/core/plugins/i18n' },
    { src: '@/core/utils' },
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  // components: true,
  components: [
    // '@/components/',
    { path: '@/components/base/' },
  ],

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://composition-api.nuxtjs.org
    '@nuxtjs/composition-api/module',
    // https://go.nuxtjs.dev/stylelint
    '@nuxtjs/stylelint-module',
    // https://windicss.org/guide/
    'nuxt-windicss',
    // https://github.com/nuxt-community/dotenv-module
    '@nuxtjs/dotenv',
    // https://www.npmjs.com/package/@nuxtjs/style-resources
    '@nuxtjs/style-resources',
    ['@nuxtjs/eslint-module', { fix: true }],
  ],

  styleResources: {
    scss: [
      '@/core/styles/scss/_colors.scss',
      '@/core/styles/scss/_mixins.scss',
      '@/core/styles/scss/_variables.scss',
    ],
    hoistUseStatements: true, // Hoists the "@use" imports. Applies only to "sass", "scss" and "less". Default: false.
  },

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    'nuxt-i18n',
  ],

  i18n: {
    locales: ['en', 'vi'],
    defaultLocale: 'vi',
    strategy: 'no_prefix',
    vueI18n: {
      fallbackLocale: {
        vi: ['en'],
        default: ['en'],
      },
      silentTranslationWarn: true,
      messages: {
        en: readYamlFile('./locales/en.yaml'),
        vi: readYamlFile('./locales/vi.yaml'),
      },
    },
    vueI18nLoader: true,
  },

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    // baseURL: process.env.API_URL || 'http://localhost:5000',
    retry: { retries: 3 },
  },

  watch: [
    'locales',
    'app.html',
    '*.config.js',
    '*.config.ts',
    '.env',
    '.nuxtignore',
  ],

  watchers: {
    webpack: {
      ignored: /node_modules/,
    },
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en',
    },
  },

  terser: {
    // https://github.com/webpack-contrib/terser-webpack-plugin#parallel
    parallel: true,
    cache: true,
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [/^element-ui/],
    extractCSS: {
      ignoreOrder: true,
    },
    plugins: [
      // Ignore all locale files of moment.js
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    ],
    babel: {
      plugins: [
        '@babel/plugin-proposal-optional-chaining',
        '@babel/plugin-proposal-nullish-coalescing-operator',
      ],
    },
    loaders: {
      cssModules: {
        modules: {
          localIdentName:
            process.env.NODE_ENV === 'development'
              ? '[local]_[hash:base64:5]'
              : '[hash:base64:8]',
        },
      },
    },
    extend(config, { isDev, isClient }) {
      if (isDev) {
        config.devtool = isClient ? 'source-map' : 'inline-source-map';
      }
      // Set up all the aliases we use in our app.
      Object.assign(config.resolve.alias, require('./aliases.config').webpack);
    },
  },

  router: {
    middleware: ['ssr-cookie'],
  },

  /*
   ** Server Middleware
   */
  serverMiddleware: [{ path: '/api/v1', handler: '@/server' }],
};
