export const useS3Store = defineStore('s3', () => {
  function getSignedUrl(filename: string) {
    return $api('/api/s3', {
      method: 'PUT',
      body: { filename },
    })
  }

  return {
    getSignedUrl,
  }
})
