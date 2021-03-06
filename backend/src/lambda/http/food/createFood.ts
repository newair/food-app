import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateFoodItemRequest } from '../../../requests/CreateFoodItemRequest'
import { v4 as uuid } from 'uuid'
import { FoodItem } from '../../../models/FoodItem'
import { getUserId } from '../../utils'
import { createFoodItemPersistence } from '../../persitence/food.persistence.layer'
import { createLogger } from '../../../utils/logger'
const logger = createLogger('CreateIngredient')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Event called', event)

  const newFoodItem: CreateFoodItemRequest = JSON.parse(event.body)

  const userId = getUserId(event)

  let newFoodItemPersistable: FoodItem = {
    ...newFoodItem,
    userId: userId,
    itemId: uuid(),
    foodId: uuid(),
    attachmentUrl: null,
  }

  newFoodItemPersistable = await createFoodItemPersistence(newFoodItemPersistable)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(newFoodItemPersistable)
  }
}
