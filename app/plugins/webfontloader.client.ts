/**
 * plugins/webfontloader.js
 *
 * webfontloader documentation: https://github.com/typekit/webfontloader
 */

export async function loadFonts() {
}

export default defineNuxtPlugin({
  parallel: true,
  async setup() {
    try {
      const webFontLoader = await import('webfontloader')

      ;(webFontLoader.default || webFontLoader).load({
        google: {
          api: 'https://fonts.googleapis.com/css2',
          families: ['Inter:wght@300;400;500;600;700;900&display=swap'],
        },
      })
    }
    catch {
      console.warn('Failed to load webfontloader')
    }
  },
})
