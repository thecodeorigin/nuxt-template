import { object, string } from 'zod'

export default defineEventHandler(async (event) => {
  const query = await getValidatedQuery(event, object({
    iso2: string(),
  }).safeParse)

  const { data } = await $fetch<{
    error: boolean
    msg: string
    data: Array<{
      name: string
      states: Array<{ name: string, state_code: string }>
      iso2: string
      iso3: string
    }>
  }>('https://countriesnow.space/api/v0.1/countries/states', {
    method: 'POST',
    body: query,
  })

  return data || []
})
