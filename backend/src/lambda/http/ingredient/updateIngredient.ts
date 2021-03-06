import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateIngredientRequest } from '../../../requests/UpdateIngredientRequest'
import { getUserId } from '../../utils'
import { updateIngredient } from '../../persitence/ingredient.persistence.layer'
import { createLogger } from '../../../utils/logger'
const logger = createLogger('updateIngredients')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('updateIngredients Event called', event)
  const itemId = event.pathParameters.itemId
  const updatedIngredient: UpdateIngredientRequest = JSON.parse(event.body)
  const userId = getUserId(event)

  let updatedNew;
  try {
    updatedNew = updateIngredient(userId, itemId, updatedIngredient)

  } catch (error) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(error)
    };
  };
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      updatedNew
    })
  };
}
