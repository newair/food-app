import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../../utils'
import { getIngredients } from '../../persitence/ingredient.persistence.layer'
import { createLogger } from '../../../utils/logger'
const logger = createLogger('GetIngredient')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('GetIngredients Event called', event)
  const userId = getUserId(event)

  try {
    const items =  (await getIngredients(userId)).Items;

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        items
      })
    };

  } catch(error){
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(error)
    };
  };

}
