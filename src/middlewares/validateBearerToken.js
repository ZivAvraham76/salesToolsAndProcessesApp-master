const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");


/// Replace {tenant-id} with your Azure AD tenant ID
const openidConfigUrl = `https://login.microsoftonline.com/${process.env.TENANTID}/v2.0/.well-known/openid-configuration`;
let jwksUri;

// Fetch the JWKS URI from OpenID Connect metadata
const fetchOpenIdConfig = async () => {
  const response = await fetch(openidConfigUrl);
  const data = await response.json();
  jwksUri = data.jwks_uri;
};

(async () => {
  await fetchOpenIdConfig();
})();

// Middleware to validate Bearer tokens
const validateBearerToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Authorization header missing or invalid.");
    return res.status(401).send("Authorization header missing or invalid.");
  }
 
  
  const token = authHeader.split(" ")[1];

  // JWKS client
  const client = jwksClient({
    jwksUri,
  });

  // Retrieve signing key
  const getKey = (header, callback) => {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        callback(err);
      } else {
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
      }
    });
  };

  // Verify the token
  jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
    if (err) {
      console.log("Invalid token.");
      return res.status(401).send("Invalid token.");
    }

    // Check that the aud   aud: 'api://56214ef0-66f7-4e05-b871-eed7a16a7fb8/', metch the clientID
    // Token is valid
    console.log(decoded)
    console.log(decoded.unique_name);
    req.user = decoded.unique_name;
    next();
  });
};

module.exports = { validateBearerToken };
