
import * as AWS from 'aws-sdk';
import * as AWSXray from 'aws-xray-sdk'

export const XAWS: any = process.env.local ? AWS: AWSXray.captureAWS(AWS);
export const docClient = process.env.local ? new XAWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000'
   })
 : new XAWS.DynamoDB.DocumentClient()

export const foodAppTable = 'serverless-food-app-submit-dev';

export const foodAppBucket = 'serverless-food-app-submit-dev';
