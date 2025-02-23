export function useCreditPackage() {
  async function getCreditPackages() {
    return await db.query.creditPackageTable.findMany()
  }

  return {
    getCreditPackages,
  }
}
