import type { HeroSectionType } from '@utils/types/landing-page'
import { getLandingPageId } from './landingPageID.get'

export default defineEventHandler(async (event) => {
  const heroReqData = await readBody<HeroSectionType>(event)

  const landingPageId = await getLandingPageId()

  const { error } = await supabaseAdmin
    .from('sys_landing_page')
    .update({
      hero_title: heroReqData.hero_title,
      hero_title_desc: heroReqData.hero_title_desc,
      hero_title_button: heroReqData.hero_title_button,
      hero_main_img_light: heroReqData.hero_main_img_light,
      hero_main_img_dark: heroReqData.hero_main_img_dark,
      hero_sub_img_light: heroReqData.hero_sub_img_light,
      hero_sub_img_dark: heroReqData.hero_sub_img_dark,
    })
    .match({ id: landingPageId })

  if (error)
    setResponseStatus(event, 400, error.message)
  else
    setResponseStatus(event, 201)

  return { success: true }
})
