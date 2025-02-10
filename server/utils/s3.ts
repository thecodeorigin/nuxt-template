import { S3Client } from '@aws-sdk/client-s3'

export function getS3Client() {
  return new S3Client({
    forcePathStyle: true,
    region: process.env.AWS_S3_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
    },
  })
}
