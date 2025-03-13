export function useCreditPackage() {
  async function getCreditPackages() {
    return await db.query.creditPackageTable.findMany({
      orderBy(schema, { asc }) {
        return [
          asc(schema.position),
        ]
      },
    })
  }

  return {
    getCreditPackages,
  }
}
