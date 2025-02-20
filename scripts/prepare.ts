import fs from 'node:fs'
import { $ } from 'execa'

import 'dotenv/config'

const commandOptions = {
  stdio: 'inherit' as const,
}

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
  databaseURL: process.env.FIREBASE_DB_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
}

const filePath = './public/firebase-config.json'

;(async function () {
  try {
    try {
      fs.writeFileSync(filePath, JSON.stringify(firebaseConfig, null, 2))
      console.log('Firebase config file written successfully')
    }
    catch (err) {
      console.error('Error writing to file:', err)
    }

    await $(commandOptions)`nuxt prepare`

    try {
      fs.mkdirSync('./server/db/migrations/meta', { recursive: true })
    }
    catch {}

    try {
      fs.writeFileSync('./server/db/migrations/meta/_journal.json', JSON.stringify({
        version: '7',
        dialect: 'postgresql',
        entries: [],
      }))
    }
    catch {}
  }
  catch (error) {
    console.error(error)

    process.exit(1)
  }
})()
