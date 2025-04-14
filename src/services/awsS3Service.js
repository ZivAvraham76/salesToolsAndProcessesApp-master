const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
// a client can be shared by different commands.
const client = new S3Client({ region: process.env.REGION });
const input = { Bucket: process.env.BUCKET };

async function S3GetObject(key) {
  try {
    input.Key = key;
    const command = new GetObjectCommand(input);
    const response = await client.send(command);
    const data = await response.Body.transformToString();
    return data;
  } catch ({ Code, Key }) {
    console.log({ Code, Key });
    return undefined;
  }
}

async function S3GetPresignedUrl(key) {
  input.Key = key;

  const command = new GetObjectCommand(input);
  try {
    const url = await getSignedUrl(client, command, { expiresIn: 900 });
    return url;
  } catch (error) {
    console.log(error);
  }
}

module.exports = { S3GetObject, S3GetPresignedUrl };
