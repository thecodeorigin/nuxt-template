import { seed } from './init.seed'

(async function () {
  await seed()

  process.exit(0)
})()
