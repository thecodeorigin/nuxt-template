import tailwindcss from '@tailwindcss/vite'
import packageJson from './package.json'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/a11y',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/hints',
    '@nuxt/icon',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxtjs/device',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'magic-regexp',
    'nuxt-security',
  ],

  $development: {
    devtools: {
      enabled: true,
    },
    routeRules: {
      '/_nitro/**': { cors: false, csurf: false },
    },
    nitro: {
      openAPI: {
        meta: {
          title: 'NuxtTemplate API',
          version: packageJson.version,
        },
      },
      experimental: {
        tasks: true,
      },
    },
    vite: {
      plugins: [
        tailwindcss(),
      ],
      server: {
        allowedHosts: true,
      },
    },
    security: {
      enabled: true,
      removeLoggers: false,
      sri: false,
      rateLimiter: false,
      csrf: {
        enabled: false,
      },
      headers: {
        contentSecurityPolicy: false, // Prevents Vite HMR from breaking
        strictTransportSecurity: false, // Prevents locking localhost to HTTPS
      },
      corsHandler: {
        origin: '*', // Easy local API testing
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
      },
    },
  },

  $production: {
    nitro: {
      preset: process.env.NITRO_PRESET || 'node-server',
    },

    security: {
      enabled: true,
      removeLoggers: true,
      sri: true,
      csrf: {
        enabled: true,
        encryptSecret: process.env.NUXT_AUTH_SECRET?.substring(0, 32),
      },
      rateLimiter: {
        tokensPerInterval: 150,
        interval: 5 * 60 * 1000, // 5 minutes
        headers: false,
        driver: {
          name: 'upstash',
          options: {
            base: 'ratelimit',
            url: process.env.NUXT_UPSTASH_REDIS_REST_URL,
            token: process.env.NUXT_UPSTASH_REDIS_REST_TOKEN,
          },
        },
        whiteList: ['127.0.0.1', '::1', 'localhost'],
        throwError: true,
      },
      headers: {
        contentSecurityPolicy: {
          'default-src': ['\'self\''],
          'script-src': ['\'self\'', '\'unsafe-inline\'', 'https://www.gstatic.com', 'https://www.google.com/recaptcha/', 'https://www.gstatic.com/recaptcha/'],
          'style-src': ['\'self\'', '\'unsafe-inline\'', 'https://fonts.googleapis.com'],
          'img-src': [
            '\'self\'',
            'data:',
            'https://www.google.com/recaptcha/',
            'https://www.gstatic.com/recaptcha/',
            'https://raw.githubusercontent.com',
            'https://github.com',
            'https://api.iconify.design',
            'https://avatars.githubusercontent.com',
            'https://lh3.googleusercontent.com/',
            'https://qr.sepay.vn',
          ],
          'font-src': ['\'self\'', 'https://fonts.gstatic.com'],
          'connect-src': ['\'self\'', 'https://www.google.com/recaptcha/', 'https://www.gstatic.com/recaptcha/', 'https://www.googleapis.com', 'https://securetoken.googleapis.com', 'https://identitytoolkit.googleapis.com', 'https://firestore.googleapis.com', 'https://api.iconify.design', 'wss://*.runopen.cloud'],
          'frame-src': [
            '\'self\'',
            'https://www.google.com/',
            'https://www.gstatic.com/recaptcha/',
            'https://www.google.com/recaptcha/',
          ],
        },
        strictTransportSecurity: {
          maxAge: 15552000,
          includeSubdomains: true,
        },
      },
      corsHandler: {
        origin: process.env.NUXT_PUBLIC_SSL_ENABLED === 'true'
          ? `https://${process.env.NUXT_PUBLIC_BASE_DOMAIN}`
          : `http://${process.env.NUXT_PUBLIC_BASE_DOMAIN}`,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        preflight: { statusCode: 204 },
      },
    },
  },

  $test: {
    runtimeConfig: {
      public: {
        firebaseApiKey: 'test-api-key',
        firebaseProjectId: 'test-project',
        firebaseAppId: '1:123456789:web:123456',
      },
    },
    security: {
      enabled: false,
      csrf: {
        enabled: false,
      },
    },
  },

  imports: {
    dirs: [
      '~/lib',
    ],
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    authSecret: '',

    webhookSigningSecret: '',

    postgresUrl: '',

    mongodbUri: '',
    mongodbCollectionName: '',
    mongodbDatabaseName: '',

    upstashRedisRestUrl: '',
    upstashRedisRestToken: '',

    redisHost: '',
    redisPassword: '',
    redisPort: 6379,

    smtpUser: '',
    smtpPass: '',
    smtpFrom: '',
    smtpPort: 1025,
    smtpHost: '',

    googleClientId: '',
    googleClientSecret: '',

    githubClientId: '',
    githubClientSecret: '',

    sepayTransactionPrefix: '',
    sepayBankNumber: '',
    sepayBankName: '',

    upstashEmail: '',
    upstashApiKey: '',

    taskSecret: '',

    public: {
      sslEnabled: false,

      baseDomain: 'localhost:3000',
    },

    // Vercel use CRON_SECRET as environment variable for scheduled functions, so we need to use it here as well
    cronSecret: process.env.CRON_SECRET || '',

    customerSupportEmail: '',
  },

  // Removed top-level routeRules and moved them to nitro.routeRules for Nuxt 4 compatibility

  compatibilityDate: '2025-02-11',
  nitro: {
    routeRules: {
      '/api/payments/sepay/webhook': { cors: false, csurf: false },
      '/api/auth/**': { cors: false, csurf: false },
      '/api/cron/**': { cors: false, csurf: false },
    },
    serverAssets: [
      {
        baseName: 'template',
        dir: './server/assets/template',
      },
    ],
  },

  a11y: {
    logIssues: false,
  },

  eslint: {
    config: {
      standalone: false,
      stylistic: false,
    },
  },

  security: {
    strict: true,
    hidePoweredBy: true,
    nonce: true,
    xssValidator: { throwError: true },
    allowedMethodsRestricter: { methods: '*', throwError: true },
    requestSizeLimiter: {
      maxRequestSizeInBytes: 2 * 1024 * 1024, // 2MB
      maxUploadFileRequestInBytes: 8 * 1024 * 1024, // 8MB
      throwError: true,
    },
    ssg: {
      meta: true,
      hashScripts: true,
      hashStyles: false,
      nitroHeaders: true,
      exportToPresets: true,
    },
    headers: {
      crossOriginResourcePolicy: 'same-origin',
      crossOriginOpenerPolicy: 'same-origin',
      crossOriginEmbedderPolicy: false,
      originAgentCluster: '?1',
      referrerPolicy: 'no-referrer',
      xContentTypeOptions: 'nosniff',
      xDNSPrefetchControl: 'off',
      xDownloadOptions: 'noopen',
      xFrameOptions: 'SAMEORIGIN',
      xPermittedCrossDomainPolicies: 'none',
      xXSSProtection: '0',
      permissionsPolicy: {
        'camera': [],
        'display-capture': [],
        'fullscreen': [],
        'geolocation': [],
        'microphone': [],
      },
    },
  },
})
