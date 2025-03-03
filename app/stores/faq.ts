export const useFaqStore = defineStore('faq', () => {
  async function fetchFaqs(query: Partial<ParsedFilterQuery>) {
    return $api('/api/faq', {
      query,
    })
  }

  return {
    fetchFaqs,
  }
})
