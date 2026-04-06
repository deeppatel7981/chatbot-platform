import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export async function uploadBufferToS3(params: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<string | null> {
  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION;
  if (!bucket || !region) return null;

  const client = new S3Client({ region });
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
    })
  );
  return `s3://${bucket}/${params.key}`;
}
