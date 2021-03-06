import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { UpdateFoodRequest } from '../../../requests/UpdateFoodRequest'
import { getUserId } from '../../utils'
import { updateFood } from '../../persitence/food.persistence.layer'
import { createLogger } from '../../../utils/logger'
const logger = createLogger('updateFood')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('updateFoods Event called', event)
  const itemId = event.pathParameters.itemId
  const updatedIngredient: UpdateFoodRequest = JSON.parse(event.body)
  const userId = getUserId(event)

  let updatedNew;
  try {
    updatedNew = updateFood(userId, itemId, updatedIngredient)

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
