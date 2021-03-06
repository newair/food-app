
import { docClient, foodAppTable, foodAppBucket } from '../../config'
import { FoodItem } from '../../models/FoodItem'
import { GenerateURLRequest } from '../../requests/GenerateURLRequest'
import { UpdateFoodRequest } from '../../requests/UpdateFoodRequest'
import { createLogger } from '../../utils/logger'
const logger = createLogger('CreateFood')

export const createFoodItemPersistence = async (newFoodItemPersistable: FoodItem) => {

  logger.info('Creating Ingredient ', newFoodItemPersistable)

  try {
    await docClient.put({
        TableName: foodAppTable,
        Item: newFoodItemPersistable,
    }).promise()

  } catch(e) {
    console.error(e)
  }
    delete newFoodItemPersistable.userId

    return newFoodItemPersistable;
}

export const updateFood = async (userId: string, itemId: string, updatedFood: UpdateFoodRequest) => {

  logger.info('Updating food ', updatedFood)

  let persitedFood;
  try{
  persitedFood = await docClient.update({
    TableName: foodAppTable,
    Key: {
      userId,
      itemId,
    },
      ":ingredientIds": updatedFood.ingredientItemIds,
    UpdateExpression: "set #na = :n, #ingredientIds = :ingredientIds",
    ConditionExpression: "itemId = :itemId",
    ExpressionAttributeValues: {
      ":n": updatedFood.name,
      ":ingredientIds": updatedFood.ingredientItemIds,
      ":itemId": itemId
    },
    ExpressionAttributeNames: {
      "#na": "name",
      "#ingredientIds": "ingredientItemIds"
    },
    ReturnValues: "UPDATED_NEW"
  }).promise()

} catch(e) {
  console.log(e)
}

  return persitedFood;
}

export const updateAttachmentURLFood = async (userId: string, itemId: string, updatedFood: GenerateURLRequest) => {

  logger.info('Updating attachmentURL Food ', updatedFood)

  let persitedFood
  try {
  persitedFood = await docClient.update({
    TableName: foodAppTable,
    Key: {
      userId,
      itemId,
    },
    UpdateExpression: "set attachmentUrl = :url",
    ExpressionAttributeValues: {
      ":url": `https://${foodAppBucket}.s3.amazonaws.com/${updatedFood.fileName}`,
    },
    ReturnValues: "UPDATED_NEW"
  }).promise()
} catch (e) {
  console.log(e)
}

  return persitedFood;
}

export const getFoods = async (userId: string) => {

  logger.info('Getting foods for user ', userId)

  let foods;

  try {
  foods = await docClient.query({
    TableName: foodAppTable,
    IndexName: 'foodIndex',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    }
  }).promise();

} catch(e) {
  console.log(e);
}

  return foods;
}

export const deleteFood = async (itemId: string, userId: string) => {

  logger.info('Deleting ingredient ', itemId)

  const ingredient = await docClient.delete({
    TableName: foodAppTable,
    Key:{
        userId,
        itemId,
    },
}).promise();

  return ingredient;
}

