(async () => {
  /* eslint-disable no-undef */
  importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js')
  importScripts(
    'https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js',
  )
  const res = await fetch('/firebase-config.json')
  const config = await res.json()
  firebase.initializeApp(config)

  const messaging = firebase.messaging()
  messaging.onBackgroundMessage((payload) => {
    console.log('[Firebase Message]:', payload)
  })
})()
