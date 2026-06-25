export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  return {
    credential: Boolean(config.adminEmail && config.adminPassword),
    thecodeorigin: Boolean(config.thecodeoriginIssuer && config.thecodeoriginClientId && config.thecodeoriginClientSecret),
  }
})
