import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  await defineEventOptions(event, { auth: true })

  const body = await readValidatedBody(event, z.object({
    filename: z.string().min(1).max(512),
    length: z.number().min(1),
  }).parse)

  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: body.filename as string,
      ContentLength: body.length,
    }),
    { expiresIn: 60 * 1 },
  )

  return {
    uploadUrl,
    assetUrl: `https://${process.env.AWS_CLOUDFRONT_DOMAIN}/${body.filename}`,
  }
})
