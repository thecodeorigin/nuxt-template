export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  return {
    credential: Boolean(config.adminEmail && config.adminPassword),
    google: Boolean(config.googleClientId && config.googleClientSecret),
    github: Boolean(config.githubClientId && config.githubClientSecret),
  }
})
