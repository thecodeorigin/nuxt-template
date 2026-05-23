import { defineCommand, runMain } from 'citty'
import { db } from './commands/db'
import { deploy } from './commands/deploy'
import { dev } from './commands/dev'
import { doctor } from './commands/doctor'
import { verify } from './commands/verify'

const main = defineCommand({
  meta: {
    name: 'harness',
    description: 'Internal, non-interactive CLI for the nuxt-template harness',
  },
  subCommands: { doctor, dev, deploy, db, verify },
})

runMain(main)
