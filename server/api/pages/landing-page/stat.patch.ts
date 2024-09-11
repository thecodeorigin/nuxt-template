import { getLandingPageId } from './landingPageID.get'
import type { FeatureSectionType, ProductStatType } from '~/utils/types/landing-page'

export default defineEventHandler(async (event) => {
  const productStatSectionData = await readBody<ProductStatType[]>(event)

  const landingPageId = await getLandingPageId()

  const { error } = await supabaseAdmin
    .from('sys_landing_page')
    .update({
      product_stats: [
        ...productStatSectionData,
      ],
    })
    .match({ id: landingPageId })

  if (error)
    setResponseStatus(event, 400, error.message)
  else
    setResponseStatus(event, 201)

  return { success: true, status: 201 }
})
