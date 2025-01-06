export default defineEventHandler((event) => {
  console.log(`[${event.method}] ${getRequestURL(event)}`)
})
