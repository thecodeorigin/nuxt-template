import { defineNuxtModule, extendPages } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: '@thecodeorigin/nuxt-opt-in',
    configKey: 'page',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: {
    app: false,
    blog: false,
    docs: false,
    saas: false,
  },
  async setup(options) {
    extendPages((pages) => {
      if (!options.app)
        pages = pages.filter(page => !page.path.startsWith('app'))
      if (!options.blog)
        pages = pages.filter(page => !page.path.startsWith('blog'))
      if (!options.docs)
        pages = pages.filter(page => !page.path.startsWith('docs'))
      if (!options.saas)
        // eslint-disable-next-line unused-imports/no-unused-vars
        pages = pages.filter(page => !page.path.startsWith('pricing'))
    })
  },
})
