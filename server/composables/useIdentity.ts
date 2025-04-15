import { and, eq } from 'drizzle-orm'
import { identityTable } from '../db/schemas'
import type { Identity } from '../types/models'

export function useIdentity() {
  function getIdentitiesByUserId(userId: string): Promise<Identity[]> {
    return db.query.identityTable.findMany({
      where: eq(identityTable.user_id, userId),
    })
  }

  function getIdentityByProvider(userId: string, provider: string): Promise<Identity | undefined> {
    return db.query.identityTable.findFirst({
      where: (fields, { and, eq }) => and(
        eq(fields.user_id, userId),
        eq(fields.provider, provider),
      ),
    })
  }

  async function createIdentity(
    userId: string,
    provider: string,
    providerUserId: string,
    providerData: Record<string, any>,
  ): Promise<Identity> {
    return (await db.insert(identityTable).values({
      user_id: userId,
      provider,
      provider_user_id: providerUserId,
      provider_data: providerData || {},
    }).returning())[0]
  }

  async function updateIdentity(
    identityId: string,
    data: Partial<Pick<Identity, 'provider_user_id' | 'provider_data'>>,
  ): Promise<Identity> {
    return (await db.update(identityTable)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(identityTable.id, identityId))
      .returning())[0]
  }

  async function upsertIdentity(
    userId: string,
    provider: string,
    providerUserId: string,
    providerData: Record<string, any>,
  ): Promise<Identity> {
    const existingIdentity = await getIdentityByProvider(userId, provider)

    if (existingIdentity) {
      return updateIdentity(existingIdentity.id, {
        provider_user_id: providerUserId,
        provider_data: providerData,
      })
    }

    return createIdentity(userId, provider, providerUserId, providerData)
  }

  function deleteIdentitiesByUserId(userId: string) {
    return db.delete(identityTable)
      .where(eq(identityTable.user_id, userId))
  }

  return {
    getIdentitiesByUserId,
    getIdentityByProvider,
    createIdentity,
    updateIdentity,
    upsertIdentity,
    deleteIdentitiesByUserId,
  }
}
