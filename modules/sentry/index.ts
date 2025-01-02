import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { addPlugin, defineNuxtModule, installModule } from '@nuxt/kit'

export default defineNuxtModule({
  async setup() {
    if (!process.env.SENTRY_TOKEN || !process.env.SENTRY_DSN)
      return

    const clientConfigFile = path.resolve(process.cwd(), './sentry.client.config.ts')
    const serverConfigFile = path.resolve(process.cwd(), './sentry.server.config.ts')

    if (!fs.existsSync(clientConfigFile)) {
      fs.copyFileSync(
        fileURLToPath(new URL('./templates/client.config.txt', import.meta.url)),
        clientConfigFile,
      )
    }

    if (!fs.existsSync(serverConfigFile)) {
      fs.copyFileSync(
        fileURLToPath(new URL('./templates/server.config.txt', import.meta.url)),
        serverConfigFile,
      )
    }

    await installModule('@sentry/nuxt/module', {
      sourceMapsUploadOptions: {
        telemetry: false,
        org: process.env.SENTRY_ORGANIZATION,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_TOKEN,
      },
    })

    addPlugin({
      mode: 'client',
      src: fileURLToPath(new URL('./runtime/plugin.ts', import.meta.url)),
    })
  },
})
