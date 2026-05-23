import { defineCommand } from 'citty'
import { printJson } from '../lib/output'
import { run } from '../lib/run'

interface StepResult { step: string, ok: boolean }

const STEPS: Array<{ step: string, cmd: string, args: string[] }> = [
  { step: 'lint', cmd: 'pnpm', args: ['lint'] },
  { step: 'typecheck', cmd: 'pnpm', args: ['typecheck'] },
  { step: 'test', cmd: 'pnpm', args: ['test'] },
]

export const verify = defineCommand({
  meta: { name: 'verify', description: 'Run the local CI gate (lint + typecheck + test)' },
  args: {
    'json': { type: 'boolean', default: false },
    'fail-fast': { type: 'boolean', description: 'Stop at the first failing step', default: true },
  },
  async run({ args }) {
    const results: StepResult[] = []
    for (const s of STEPS) {
      const res = await run(s.cmd, s.args)
      const ok = res.code === 0
      results.push({ step: s.step, ok })
      if (!args.json) {
        console.log(`${ok ? '✔' : '✗'} ${s.step}`)
        if (!ok)
          console.log(res.stdout.slice(-4000) + res.stderr.slice(-2000))
      }
      if (!ok && args['fail-fast'])
        break
    }
    if (args.json)
      printJson({ results, ok: results.every(r => r.ok) && results.length === STEPS.length })
    process.exit(results.every(r => r.ok) && results.length === STEPS.length ? 0 : 1)
  },
})
