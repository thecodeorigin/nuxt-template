/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js')
importScripts(
  'https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js',
)

firebase.initializeApp({
  apiKey: 'AIzaSyAehlTDxwiCdNWz9nnadRsVWOEo6k-t6Ik',
  authDomain: 'truyentest-cc184.firebaseapp.com',
  databaseURL: 'https://truyentest-cc184-default-rtdb.firebaseio.com',
  projectId: 'truyentest-cc184',
  storageBucket: 'truyentest-cc184.appspot.com',
  messagingSenderId: '36837030576',
  appId: '1:36837030576:web:c6fe6fbbe39968da311975',
  measurementId: 'G-YKDZWDR57S',
})
// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging()
messaging.onBackgroundMessage((payload) => {
  console.log('[Firebase Message]:', payload)
})
