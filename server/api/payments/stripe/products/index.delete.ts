export default defineEventHandler(async (event) => {
  await defineEventOptions(event, { auth: true })
})
