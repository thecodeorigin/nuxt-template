import type { PostSenlyzerDownloadableResponse, PostSenlyzerResponse, SenlyzerDownloadablePayload, SenlyzerPayload } from '@/utils/types/senlyzer.js'

export const useSenlyzerStore = defineStore('senlyzer', () => {
  function getDownloadable(payload: SenlyzerDownloadablePayload) {
    return $api<PostSenlyzerDownloadableResponse>('/downloadable', {
      method: 'POST',
      body: payload,
    })
  }

  function uploadBatch(payload: SenlyzerPayload) {
    return $api<PostSenlyzerResponse>('/senlyzer', {
      method: 'POST',
      body: payload,
    })
  }

  return {
    getDownloadable,
    uploadBatch,
  }
})
