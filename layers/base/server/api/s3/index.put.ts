import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'

export default defineEventHandler(async (event) => {
  await defineEventOptions(event, { auth: true })

  const body = await readBody(event)

  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: body.filename as string,
    }),
    { expiresIn: 60 * 2 },
  )

  return {
    uploadUrl,
    assetUrl: `https://${process.env.AWS_CLOUDFRONT_DOMAIN}/${body.filename}`,
  }
})
