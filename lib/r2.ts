import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'zyai-images'
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL

export function isR2Configured(): boolean {
  return !!(R2_ACCOUNT_ID && R2_ACCESS_KEY && R2_SECRET_KEY && R2_PUBLIC_URL)
}

function getClient(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY!,
      secretAccessKey: R2_SECRET_KEY!,
    },
  })
}

export async function uploadToR2(
  buffer: Buffer,
  path: string,
  contentType: string
): Promise<string> {
  const client = getClient()
  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: path,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  )
  return `${R2_PUBLIC_URL}/${path}`
}

export async function deleteFromR2(url: string): Promise<void> {
  if (!R2_PUBLIC_URL || !url.startsWith(R2_PUBLIC_URL)) return
  const path = url.slice(R2_PUBLIC_URL.length + 1)
  const client = getClient()
  await client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: path }))
}
