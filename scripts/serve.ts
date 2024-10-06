import { $ } from 'execa'

import 'dotenv/config'

const commandOptions = {
  stdio: 'inherit' as const,
};

(async function () {
  try {
    $(commandOptions)`nuxt dev`
  }
  catch (error) {
    console.error(error)

    process.exit(1)
  }
})()
