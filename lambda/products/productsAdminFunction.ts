/* eslint-disable import/no-absolute-path */
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { Product, ProductRepository } from '/opt/nodejs/productsLayer';
import { ProductEvent, ProductEventType } from '/opt/nodejs/productsEventsLayer';
import { DynamoDB, Lambda } from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';

AWSXRay.captureAWS(require('aws-sdk'));

const productDdb = process.env.PRODUCTS_DDB!;
const productEventFunctionName = process.env.PRODUCTS_VENTS_FUNCTION_NAME!;

const ddbClient = new DynamoDB.DocumentClient();
const lambdaClient = new Lambda();

const productRepository = new ProductRepository(ddbClient, productDdb);

export async function handler (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;

  console.log(`API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${lambdaRequestId}`);

  if (event.resource === '/products') {
    try {
      console.log('POST /products');

      const product = JSON.parse(event.body!) as Product;
      const productCreated = await productRepository.create(product);

      const response = await sendProductEvent(productCreated, ProductEventType.CREATED, 'test@test.com', lambdaRequestId);
      console.log(response);

      return {
        statusCode: 201,
        body: JSON.stringify({
          message: '[Admin] Success POST Products - Ok',
          productCreated
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
  } else if (event.resource === '/products/{id}') {
    const productId = event.pathParameters!.id as string;

    if (event.httpMethod === 'PUT') {
      try {
        const product = JSON.parse(event.body!) as Product;
        const productUpdated = await productRepository.updateProduct(productId, product);

        const response = await sendProductEvent(productUpdated, ProductEventType.UPDATED, 'testUpdate@test.com', lambdaRequestId);
        console.log(response);

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: `[Admin] Success update Product - ${productId}`,
            productUpdated
          })
        };
      } catch (ConditionaCheckFailedException) {
        console.error(ConditionaCheckFailedException);

        return {
          statusCode: 404,
          body: JSON.stringify({
            message: 'Product not found.'
          })
        };
      }
    } else if (event.httpMethod === 'DELETE') {
      try {
        const productDeleted = await productRepository.deleteProduct(productId);
        const response = await sendProductEvent(productDeleted, ProductEventType.DELETED, 'testDeleted@test.com', lambdaRequestId);
        console.log(response);

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: `[Admin] Success delete Product - ${productId}`,
            productDeleted
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

  return {
    statusCode: 404,
    body: JSON.stringify({
      message: '[Admin] Route not found.'
    })
  };
}

async function sendProductEvent (product: Product, eventType: ProductEventType, email: string, lambdaRequestId: string) {
  const event: ProductEvent = {
    email,
    eventType,
    productCode: product.code,
    productId: product.id,
    productPrice: product.price,
    requestId: lambdaRequestId
  };

  lambdaClient.invoke({
    FunctionName: productEventFunctionName,
    Payload: JSON.stringify(event),
    InvocationType: 'RequestResponse'
  }).promise();
};
