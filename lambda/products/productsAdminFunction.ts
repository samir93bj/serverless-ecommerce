import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export async function handler (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;

  console.log(`API Gateway RequestId: ${apiRequestId}`);
  console.log(`Lambda RequestId: ${lambdaRequestId}`);

  if (event.resource === '/products') {
    console.log('POST /products');

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: '[Admin] Success POST Products - Ok'
      })
    };
  } else if (event.resource === '/products/{id}') {
    const productId = event.pathParameters!.id as string;
    if (event.httpMethod === 'PUT') {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `[Admin] Success PUT Product - ${productId}`
        })
      };
    } else if (event.httpMethod === 'DELETE') {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `[Admin] Success DELETE Product - ${productId}`
        })
      };
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: '[Admin] Success POST Products - Ok'
    })
  };
}
