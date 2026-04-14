import { CreateBucketCommand, HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import http from "http";

const rawEndpoint = process.env.MINIO_ENDPOINT || "http://127.0.0.1:9000";
const normalizedEndpoint = rawEndpoint.replace("localhost", "127.0.0.1");

const s3 = new S3Client({
  endpoint: normalizedEndpoint,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER,
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD,
  },
  forcePathStyle: true,
  tls: false,
  requestHandler: new NodeHttpHandler({
    httpAgent: new http.Agent(),
  }),
});

export const BUCKET_NAME = process.env.MINIO_BUCKET_NAME;

export const ensureBucketExists = async () => {
  if (!BUCKET_NAME) {
    throw new Error("MINIO_BUCKET_NAME is not set");
  }

  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
  } catch (err) {
    const statusCode = err?.$metadata?.httpStatusCode;
    if (statusCode !== 404 && statusCode !== 400) {
      throw err;
    }
    await s3.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
  }
};

export default s3;