import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../../utils';
import { deleteFood } from '../../persitence/food.persistence.layer';
import { createLogger } from '../../../utils/logger'
const logger = createLogger('DeleteIngredient')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Event called', event)
  const itemId = event.pathParameters.itemId
  const userId = getUserId(event)
  let deletedFood

  try {
    deletedFood = await deleteFood(itemId, userId);
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
      deletedFood
    })
  };
}
