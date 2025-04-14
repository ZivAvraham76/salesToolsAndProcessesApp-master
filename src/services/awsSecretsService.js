// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html

const {
    SecretsManagerClient,
    GetSecretValueCommand,
  } = require("@aws-sdk/client-secrets-manager");
  
  
  function updateEnvironmentVariables (appSecret) {
    process.env.EXPRESS_SESSION_SECRET = appSecret.EXPRESS_SESSION_SECRET;
    process.env.CLIENTID = appSecret.CLIENTID;
    process.env.TENANTID = appSecret.TENANTID;
    process.env.CLIENTSECRET = appSecret.CLIENTSECRET;
    process.env.LITMOSE_API_KEY = appSecret.LITMOSE_API_KEY;
  }
  
  
  async function retrieveSecrets() {
    const secret_name = process.env.SECRET_NAME;
  
    const client = new SecretsManagerClient({
      region: process.env.REGION,
    });
  
    let response;
  
    try {
      response = await client.send(
        new GetSecretValueCommand({
          SecretId: secret_name,
          VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
        })
      );
    } catch (error) {
      // For a list of exceptions thrown, see
      // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
      throw error;
    }
  
    // Parsing the fetched data into JSON
    const secret = await JSON.parse(response.SecretString);
    updateEnvironmentVariables(secret);
  }
  
  module.exports = retrieveSecrets;
  