import path from 'node:path'
import { $ } from 'execa'

import 'dotenv/config'

const commandOptions = {
  stdio: 'inherit' as const,
};

(async function () {
  try {
    $(commandOptions)`stripe --api-key ${process.env.STRIPE_SECRET_KEY!} fixtures ./scripts/stripe-fixtures.json`
  }
  catch (error) {
    console.error(error)

    process.exit(1)
  }
})()
