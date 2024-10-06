import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    {
      builder: 'mkdist',
      input: './server/db/schemas',
      outDir: './server/db/schemas/cjs',
      ext: 'cjs',
      format: 'cjs',
      pattern: '**/*.ts',
    },
    {
      builder: 'mkdist',
      input: './server/db/schemas',
      outDir: './server/db/schemas/mjs',
      ext: 'mjs',
      format: 'esm',
      pattern: '**/*.ts',
    },
  ],
})
