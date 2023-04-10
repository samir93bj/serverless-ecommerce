/* eslint-disable import/no-absolute-path */
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { ProductRepository } from '/opt/nodejs/productsLayer';
import { DynamoDB } from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';

AWSXRay.captureAWS(require('aws-sdk'));

const productDdb = process.env.PRODUCTS_DDB!;
const ddbClient = new DynamoDB.DocumentClient();

const productRepository = new ProductRepository(ddbClient, productDdb);

export async function handler (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;

  console.log(`API Gateway RequestId: ${apiRequestId}`);
  console.log(`Lambda RequestId: ${lambdaRequestId}`);

  const method = event.httpMethod;
  if (event.resource === '/products') {
    if (method === 'GET') {
      try {
        console.log('GET /products');

        const products = await productRepository.getAllProducts();

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Success GET Products - Ok',
            products
          })
        };
      } catch (err) {
        console.error((<Error>err).message);

        return {
          statusCode: 404,
          body: JSON.stringify({
            message: (<Error>err).message
          })
        };
      }
    }
  }

  if (event.resource === '/products/{id}') {
    try {
      const productId = event.pathParameters!.id as string;

      const product = await productRepository.getProductById(productId);

      console.log(`GET /products/${productId}`);
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `Success GET /products/${productId}`,
          product
        })
      };
    } catch (err) {
      console.error((<Error>err).message);

      return {
        statusCode: 404,
        body: JSON.stringify({
          message: (<Error>err).message
        })
      };
    }
  }
  return {
    statusCode: 400,
    body: JSON.stringify({
      message: 'Bad request.'
    })
  };
};
