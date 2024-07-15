export default defineEventHandler(async () => {
  const { data } = await $fetch<{
    error: boolean
    msg: string
    data: Array<{
      name: string
      flag: string
      iso2: string
      iso3: string
    }>
  }>('https://countriesnow.space/api/v0.1/countries/flag/images')

  return data || []
})
