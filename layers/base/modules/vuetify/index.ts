import { fileURLToPath } from 'node:url'
import { addPlugin, defineNuxtModule, installModule } from '@nuxt/kit'

export default defineNuxtModule({
  async setup() {
    await installModule('vuetify-nuxt-module', {
      moduleOptions: {
        styles: {
          configFile: fileURLToPath(new URL('../../app/assets/styles/variables/_vuetify.scss', import.meta.url)),
        },
      },
    })

    addPlugin({
      src: fileURLToPath(new URL('./runtime/plugin.ts', import.meta.url)),
    })
  },
})
