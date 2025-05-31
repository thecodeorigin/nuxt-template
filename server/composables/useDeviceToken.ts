import { and, eq } from 'drizzle-orm'
import { deviceTable } from '@base/server/db/schemas'
import type { Device } from '@base/server/types/models'

export function useDeviceToken() {
  async function getDeviceTokens(userId: string): Promise<Device[]> {
    return db.query.deviceTable.findMany({
      where: eq(deviceTable.user_id, userId),
    })
  }

  function getDeviceToken(userId: string, deviceToken: string): Promise<Device | undefined> {
    return db.query.deviceTable.findFirst({
      where: (schema, { eq }) => {
        return eq(schema.token_device, deviceToken)
      },
    })
  }

  async function createDeviceToken(userId: string, deviceToken: string): Promise<Device> {
    return (await db.insert(deviceTable).values({
      user_id: userId,
      token_device: deviceToken,
    }).returning())[0]
  }

  function deleteDeviceToken(userId: string, deviceToken: string) {
    return db.delete(deviceTable).where(
      and(
        eq(deviceTable.user_id, userId),
        eq(deviceTable.token_device, deviceToken),
      ),
    )
  }

  return {
    getDeviceToken,
    getDeviceTokens,
    createDeviceToken,
    deleteDeviceToken,
  }
}
