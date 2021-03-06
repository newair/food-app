// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'qxpayejn8h'
// export const apiEndpoint = `http://localhost:4000/dev`;
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-h9-p2fxc.au.auth0.com',            // Auth0 domain
  clientId: 'WHwg2o2QLVLq3toLgK5NBELmyxGQAKeQ',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
