import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { Product, ProductRepository } from '/opt/nodejs/productsLayer';
import { DynamoDB } from 'aws-sdk';

const productDdb = process.env.PRODUCTS_DDB!;
const ddbClient = new DynamoDB.DocumentClient();

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
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: `[Admin] Success PUT Product - ${productId}`
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
    } else if (event.httpMethod === 'DELETE') {
      try {
        const product = await productRepository.deleteProduct(productId);

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: `[Admin] Success delete Product - ${productId}`,
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
  }

  return {
    statusCode: 404,
    body: JSON.stringify({
      message: '[Admin] Route not found.'
    })
  };
}
