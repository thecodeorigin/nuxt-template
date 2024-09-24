import { postTable } from '../db/schemas/post.schema'
import { useCrud } from './useCrud'
import type { ParsedFilterQuery } from '@/server/utils/filter'

export function usePostCrud() {
  const {
    getRecordsPaginated,
    getRecordByKey,
    createRecord,
    updateRecordByKey,
    deleteRecordByKey,
    countRecords,
  } = useCrud(postTable, {
    searchBy: ['title', 'description'],
  })

  async function getPostsPaginated(options: ParsedFilterQuery) {
    const { data, total } = await getRecordsPaginated(options)

    return { data, total }
  }

  async function getPostById(id: string) {
    const { data } = await getRecordByKey('id', id)

    return { data }
  }

  async function updatePostById(id: string, body: any) {
    const { data } = await updateRecordByKey('id', id, body)

    return { data }
  }

  async function createPost(body: any) {
    const { data } = await createRecord(body)

    return { data }
  }

  async function deletePostById(id: string) {
    const { data } = await deleteRecordByKey('id', id)

    return { data }
  }

  function countPosts() {
    return countRecords()
  }

  return {
    getPostsPaginated,
    getPostById,
    createPost,
    updatePostById,
    deletePostById,
    countPosts,
  }
}
