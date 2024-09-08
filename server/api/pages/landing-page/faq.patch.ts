import { getLandingPageId } from './landingPageID.get'
import type { FAQSectionType } from '~/types/landing-page'

export default defineEventHandler(async (event) => {
  const faqReqBody = await readBody<FAQSectionType>(event)

  const landingPageId = await getLandingPageId()

  const { error } = await supabaseAdmin
    .from('sys_landing_page')
    .update({
      faq_title: faqReqBody.faq_title,
      faq_title_desc: faqReqBody.faq_title_desc,
      faq_data: [
        ...faqReqBody.faq_data || [],
      ],
    })
    .match({ id: landingPageId })

  if (error)
    setResponseStatus(event, 400, error.message)
  else
    setResponseStatus(event, 201)

  return { success: true, status: 201 }
})
