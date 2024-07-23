import fs from 'node:fs'
import dotenv from 'dotenv'

dotenv.config()

const firebaseConfig = {
  apiKey: process.env.FB_API_KEY,
  authDomain: process.env.FB_AUTH_DOMAIN,
  databaseURL: process.env.FB_DB_URL,
  projectId: process.env.FB_PROJECT_ID,
  storageBucket: process.env.FB_STORAGE_BUCKET,
  messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
  appId: process.env.FB_APP_ID,
  measurementId: process.env.FB_MEASUREMENT_ID,
}

const filePath = './public/firebase-config.json'

try {
  fs.writeFileSync(filePath, JSON.stringify(firebaseConfig, null, 2))
}
catch (err) {
  console.error('Error writing to file:', err)
}
