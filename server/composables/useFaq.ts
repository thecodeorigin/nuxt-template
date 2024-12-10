export function useFaq() {
  async function getFaqQuestions(options: ParsedFilterQuery) {
    const data = await db.query.sysFaqCategoryTable.findMany({
      with: {
        questions: {
          limit: options.limit,
          orderBy(schema, { asc, desc }) {
            return options.sortAsc
              ? asc((schema as any)[options.sortBy])
              : desc((schema as any)[options.sortBy])
          },
          where(schema, { or, ilike }) {
            if (options.keyword && options.keywordLower) {
              return or(
                ilike(schema.question, `%${options.keyword}%`),
                ilike(schema.question, `%${options.keywordLower}%`),
              )
            }
          },
        },
      },
    })

    return data
  }

  return {
    getFaqQuestions,
  }
}
