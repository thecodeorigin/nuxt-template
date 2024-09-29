export default defineNitroPlugin((nitroApp: any) => {
  nitroApp.hooks.hook('user:get', (data: any) => {
    console.log('User get:', data)
  })

  nitroApp.hooks.hook('user:created', (data: any) => {
    console.log('User created:', data)
  })
})
