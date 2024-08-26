import { QueryTypes, Sequelize } from 'sequelize'

const sequelize = new Sequelize(process.env.SUPABASE_CONNECTION_STRING!)

export async function sql<T extends object>(query: string) {
  return sequelize.query<T>(query, {
    type: QueryTypes.SELECT,
  })
}
