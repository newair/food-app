import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = 'https://dev-h9-p2fxc.au.auth0.com/.well-known/jwks.json'
const cert = `-----BEGIN CERTIFICATE-----
MIIDDDCCAfSgAwIBAgIITenTjOfmr5EwDQYJKoZIhvcNAQELBQAwJDEiMCAGA1UE
AxMZZGV2LWg5LXAyZnhjLmF1LmF1dGgwLmNvbTAeFw0yMDExMTYxMDE4MjFaFw0z
NDA3MjYxMDE4MjFaMCQxIjAgBgNVBAMTGWRldi1oOS1wMmZ4Yy5hdS5hdXRoMC5j
b20wggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDV9CbGH6u0SKzV++ZP
r7AyQvV6RdMyFGK2jxpbFvo5S5uxmlwfqL+AiXD0yx8VkFZTxRbyG5EqVG1J7Dm2
I9e4BFXSH+786LPp7o9UtwPwTc6ARtqo1nNp13S2je6CMRL1FapMhLU9YsuSfZoF
5UvYHrsmA5faHqKdftrsYy0qtz33S++Txz9a5f/wlziLRzz7UoG9Bb2wPEUIUNpW
nARRcNE7UXk+RqOhQexxIYWu9N0WJLFH7Q1tgM8o6/wW0pAOlHDaUN1L70hZcZI2
KuZgYjo8IWVrQjXvrMv+49DqWjCu1/FzV5YdQBIivE7KAeMjdlTCOkWMTpD+84id
1kxPAgMBAAGjQjBAMA8GA1UdEwEB/wQFMAMBAf8wHQYDVR0OBBYEFBql5cFWexmy
ZcpByGQ/KCpfTr/9MA4GA1UdDwEB/wQEAwIChDANBgkqhkiG9w0BAQsFAAOCAQEA
xnCSwbTH9n7pMQGT5qCSgdMvVyPnwwvXPRp4FKIOAmkvoxMdT2gyDAA8Azot0nU7
Y5xxytuwG1JtQg5Ax6qjaWjJuQekxVkoZIqVQ1X6bu805vnXq+FyzbjAWE+OH15m
loeuYo/4KR21FRRjlcEjbufEXR7d9RvYNUzLznBF02uQFn5yfWJvRliQ2RjYV050
eFKCEtfF3e9MIoo7f1KhO2Qjus7wu8btiejL91YzsZ0hbSY3qwmRfdqX2HX1/TMj
fE8Uz7w0t0znNkOuGO0o9/WkFSARiiAguXoHtdJGXf5O0juFb/epPM7SjsgBlQzV
2ZcwpHoeofGT3ipWv8FIzg==
-----END CERTIFICATE-----`;

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtPayload {
  
  const token = getToken(authHeader) 

  verify(token, cert, {algorithms:['RS256']})

  const jwt: Jwt = decode(token, { complete: true }) as Jwt


  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  return jwt.payload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
