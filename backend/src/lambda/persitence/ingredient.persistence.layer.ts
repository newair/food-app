
import { docClient, foodAppTable, foodAppBucket } from '../../config'
import { IngredientItem } from '../../models/IngredientItem'
import { GenerateURLRequest } from '../../requests/GenerateURLRequest'
import { UpdateIngredientRequest } from '../../requests/UpdateIngredientRequest'
import { createLogger } from '../../utils/logger'
const logger = createLogger('CreateIngredient')

export const createIngredientPersistence = async (newIngredientPersistable: IngredientItem) => {

  logger.info('Creating Ingredient ', newIngredientPersistable)

  try {
    await docClient.put({
        TableName: foodAppTable,
        Item: newIngredientPersistable,
    }).promise()

  } catch(e) {
    console.error(e)
  }
    delete newIngredientPersistable.userId

    return newIngredientPersistable;
}

export const updateIngredient = async (userId: string, itemId: string, updatedIngredient: UpdateIngredientRequest) => {

  logger.info('Updating ingredient ', updatedIngredient)
  let persitedIngredient
  try {
  persitedIngredient = await docClient.update({
    TableName: foodAppTable,
    Key: {
      userId,
      itemId,
    },
    UpdateExpression: "set #na = :n",
    ConditionExpression: "itemId = :itemId",
    ExpressionAttributeValues: {
      ":n": updatedIngredient.name,
      ":itemId": itemId,
    },
    ExpressionAttributeNames: {
      "#na": "name"
    },
    ReturnValues: "UPDATED_NEW"
  }).promise()

} catch(e) {
  console.log(e)
}

  return persitedIngredient;
}

export const updateAttachmentURLIngredient = async (userId: string, itemId: string, updatedIngredient: GenerateURLRequest) => {

  logger.info('Updating attachmentURL Ingredient ', updatedIngredient)

  const persitedIngredient = await docClient.update({
    TableName: foodAppTable,
    Key: {
      userId,
      itemId,
    },
    UpdateExpression: "set attachmentUrl = :url",
    ExpressionAttributeValues: {
      ":url": `https://${foodAppBucket}.s3.amazonaws.com/${updatedIngredient.fileName}`,
    },
    ReturnValues: "UPDATED_NEW"
  }).promise()

  return persitedIngredient;
}

export const getIngredients = async (userId: string) => {

  logger.info('Getting ingredients for user ', userId)

  let ingredients;

  try {
  ingredients = await docClient.query({
    TableName: foodAppTable,
    KeyConditionExpression: 'userId = :userId',
    IndexName: 'ingredientIndex',
    ExpressionAttributeValues: {
      ':userId': userId,
    }
  }).promise();

} catch(e) {
  console.log(e);
}

  return ingredients;
}

export const deleteIngredient = async (itemId: string, userId: string) => {

  logger.info('Deleting ingredient ', itemId)

  const ingredient = await docClient.delete({
    TableName: foodAppTable,
    Key:{
        itemId,
        userId,
    },
}).promise();

  return ingredient;
}

