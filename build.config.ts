import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  // If entries is not provided, will be automatically inferred from package.json
  entries: [
    {
      builder: 'mkdist',
      input: './server/db/schemas',
      outDir: './server/db/schemas/cjs',
      ext: 'cjs',
      pattern: '**/*.ts',
    },
    {
      builder: 'mkdist',
      input: './server/db/schemas',
      outDir: './server/db/schemas/mjs',
      ext: 'mjs',
      pattern: '**/*.ts',
    },
  ],
  failOnWarn: false,
})
