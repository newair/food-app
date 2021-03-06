import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { foodAppBucket, XAWS } from '../../../config'
import { getUserId } from '../../utils'
import { GenerateURLRequest } from '../../../requests/GenerateURLRequest'
import { updateAttachmentURLIngredient } from '../../persitence/ingredient.persistence.layer'
import { createLogger } from '../../../utils/logger'
const logger = createLogger('generateUploadURL')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  logger.info('GenerateUploadURL Event called', event)
  const userId = getUserId(event);
  const request: GenerateURLRequest  = JSON.parse(event.body);
  const itemId = event.pathParameters.itemId;
  
  const s3 = new XAWS.S3()
  const signedUrl = s3.getSignedUrl('putObject', {
    Bucket: foodAppBucket,
    Key: request.fileName,
    ContentType: request.contentType
  });

  await updateAttachmentURLIngredient(userId, itemId, request);
  
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadURL: signedUrl
    })
  };
}
