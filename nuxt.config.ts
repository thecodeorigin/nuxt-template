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
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@nuxtjs/device',
    '@nuxthub/core',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'magic-regexp',
    'nuxt-security',
  ],

  image: { provider: 'none' },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
    },
  },

  $development: {
    devtools: {
      enabled: true,
    },
    nitro: {
      openAPI: {
        meta: {
          title: 'NuxtTemplate API',
          version: packageJson.version,
        },
      },
      // Nuxt DevTools' nitro inspector hits /_nitro/** — cors + csurf
      // would block it in dev (no equivalent path exists in prod).
      routeRules: {
        '/_nitro/**': { cors: false, csurf: false },
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
  },

  $production: {
    nitro: {
      // Cloudflare Workers (modules syntax). CI deploys with `wrangler deploy`.
      preset: process.env.NITRO_PRESET || 'cloudflare_module',
    },
    // Production Cloudflare bindings. NuxtHub generates the wrangler binding
    // config from this block at build time (wrangler.jsonc only carries the
    // observability block). Cloudflare has no resource auto-association, so the
    // resource IDs are injected from build-time env vars:
    //   - prod: GitHub Actions variables (CF_D1_DATABASE_ID, CF_KV_NAMESPACE_ID,
    //     CF_CACHE_NAMESPACE_ID, CF_R2_BUCKET)
    //   - preview: the preview workflow creates a per-PR D1 and passes its id in
    // kv and cache MUST be separate KV namespaces.
    hub: {
      db: {
        dialect: 'sqlite',
        driver: 'd1',
        connection: { databaseId: process.env.CF_D1_DATABASE_ID },
      },
      kv: {
        driver: 'cloudflare-kv-binding',
        namespaceId: process.env.CF_KV_NAMESPACE_ID,
      },
      cache: {
        driver: 'cloudflare-kv-binding',
        namespaceId: process.env.CF_CACHE_NAMESPACE_ID,
      },
      blob: {
        driver: 'cloudflare-r2',
        bucketName: process.env.CF_R2_BUCKET || 'nuxt-template-prod',
        binding: 'BLOB',
      },
    },
    image: {
      provider: 'cloudflare',
    },
  },

  imports: {
    // ~/lib is auto-imported on top of Nuxt's defaults ($http, cn,
    // valueUpdater are used everywhere). Composables and utils (root +
    // layers) keep Nuxt's default auto-import behaviour.
    dirs: ['~/lib'],
  },

  // Disable user component auto-import so call sites have explicit imports —
  // makes the source path obvious for both AI agents and humans. Nuxt UI's
  // <U*> components are registered via @nuxt/ui's addComponentsDir call
  // (from the module) and stay auto-imported.
  components: false,

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    authSecret: '',

    webhookSigningSecret: '',

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

    taskSecret: '',

    public: {
      sslEnabled: false,

      baseDomain: 'localhost:3000',

      demoMode: false,
    },

    // Bearer token guarding /api/cron/** (see server/utils/cron.ts).
    cronSecret: process.env.CRON_SECRET || '',

    customerSupportEmail: '',
  },

  compatibilityDate: '2025-02-11',
  nitro: {
    experimental: {
      tasks: true,
    },
    routeRules: {
      // Webhook + auth routes are exempt from CORS / CSRF — they either
      // self-validate (webhook signature, OAuth state) or operate as the
      // session-establishment surface where same-origin assumptions
      // don't apply yet.
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

  // Production-grade security applied uniformly across development,
  // preview and production so the dev experience matches what ships.
  // The only env-aware bit is the prod domain (corsHandler origin); the
  // rate limiter uses an in-process lru-cache driver everywhere.
  security: {
    enabled: true,
    strict: true,
    hidePoweredBy: true,
    nonce: true,
    removeLoggers: true,
    sri: true,
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
    csrf: {
      enabled: true,
    },
    // lru-cache is in-process — scoped to a single Worker isolate on
    // Cloudflare. Fine for a template / single-region; for cross-isolate
    // limiting back this with a KV- or Durable-Object-backed unstorage driver.
    rateLimiter: {
      tokensPerInterval: 150,
      interval: 5 * 60 * 1000, // 5 minutes
      headers: false,
      driver: { name: 'lru-cache' },
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
        // ws:/wss: cover Vite HMR in dev and any WebSocket APIs in prod;
        // browsers ignore the protocol-only entries when not in use, so
        // there's no production cost to keeping them here.
        'connect-src': [
          '\'self\'',
          'ws:',
          'wss:',
          'https://www.google.com/recaptcha/',
          'https://www.gstatic.com/recaptcha/',
          'https://www.googleapis.com',
          'https://securetoken.googleapis.com',
          'https://identitytoolkit.googleapis.com',
          'https://firestore.googleapis.com',
          'https://api.iconify.design',
        ],
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

  hub: {
    db: 'sqlite',
    blob: true,
    kv: true,
    cache: true,
  },
})
