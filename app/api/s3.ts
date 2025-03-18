export function useApiS3() {
  function getSignedUrl(filename: string) {
    return $api<{ uploadUrl: string, assetUrl: string }>('/api/s3', {
      method: 'PUT',
      body: { filename },
    })
  }

  return {
    getSignedUrl,
  }
}
