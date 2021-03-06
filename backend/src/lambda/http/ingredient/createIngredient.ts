import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { CreateIngredientRequest } from '../../../requests/CreateIngredientRequest'
import { v4 as uuid } from 'uuid'
import { IngredientItem } from '../../../models/IngredientItem'
import { getUserId } from '../../utils'
import { createIngredientPersistence } from '../../persitence/ingredient.persistence.layer'
import { createLogger } from '../../../utils/logger'
const logger = createLogger('CreateIngredient')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Event called', event)

  const newIngredient: CreateIngredientRequest = JSON.parse(event.body)

  const userId = getUserId(event)

  let newIngredientPersistable: IngredientItem = {
    ...newIngredient,
    userId: userId,
    itemId: uuid(),
    ingredientId: uuid(),
    attachmentUrl: null,
  }

  newIngredientPersistable = await createIngredientPersistence(newIngredientPersistable)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(newIngredientPersistable)
  }
}
