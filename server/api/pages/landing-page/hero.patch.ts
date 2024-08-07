import type { HeroSectionType } from '~/types/landing-page'

export default defineEventHandler(async (event) => {
  const heroSectionData = await readBody<HeroSectionType>(event)

  const { data, error } = await supabaseAdmin
    .from('sys_landing_page')
    .update({
      hero_title: heroSectionData.hero_title,
      hero_title_desc: heroSectionData.hero_title_desc,
      hero_title_button: heroSectionData.hero_title_button,
    })
    .match({ id: 'df02f75c-afab-41ef-ab6d-e1aa04d7ec6d' })
    .select()
    .single()

  if (error)
    setResponseStatus(event, 400, error.message)
  else
    setResponseStatus(event, 201)

  return { data }
})
