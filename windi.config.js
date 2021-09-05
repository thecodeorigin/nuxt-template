import { defineConfig } from 'windicss/helpers';
import { colors } from './core/config/windi/colors';

export default defineConfig({
  // Preflight is enabled on-demanded.
  // https://windicss.org/integrations/nuxt.html#preflight-style-resetting
  preflight: true,
  important: true,
  theme: {
    colors,
  },
  // By default, we scan your source code statically and find all the usages of the utilities
  // this will not be detected
  // <div :class="{ ['p-'+ size]: true}">
  safelist: [],
  extract: {
    include: ['**/*.{vue,html,jsx}'],
    exclude: [
      'node_modules',
      'dist',
      '.git',
      '.github',
      '.nuxt',
    ],
  },
});
