import type { FAQSectionType } from '~/types/landing-page'

export default defineEventHandler(async (event) => {
  const faqReqBody = await readBody<FAQSectionType>(event)

  const { error } = await supabaseAdmin
    .from('sys_landing_page')
    .update({
      faq_title: faqReqBody.faq_title,
      faq_title_desc: faqReqBody.faq_title_desc,
      faq_data: [
        ...faqReqBody.faq_data || [],
      ],
    })
    .match({ id: 'df02f75c-afab-41ef-ab6d-e1aa04d7ec6d' })

  if (error)
    setResponseStatus(event, 400, error.message)
  else
    setResponseStatus(event, 201)

  return { success: true, status: 201 }
})
