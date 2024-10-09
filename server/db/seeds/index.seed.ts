import { seed } from './all.seed'

(async function () {
  await seed()

  process.exit(0)
})()
