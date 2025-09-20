export const authConfig = {
  domain: process.env.AUTH0_DOMAIN,
  audience: process.env.AUTH0_AUDIENCE,
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
};