import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export async function handler (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;

  console.log(`API Gateway RequestId: ${apiRequestId}`);
  console.log(`Lambda RequestId: ${lambdaRequestId}`);

  const method = event.httpMethod;
  if (event.resource === '/products') {
    if (method === 'GET') {
      console.log('GET');

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Success GET Products - Ok'
        })
      };
    }
  } else if (event.resource === '/products/{id}') {
    const productId = event.pathParameters!.id as string;

    console.log(`GET /products/${productId}`);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Success GET /products/${productId}`
      })
    };
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      message: 'Bad request.'
    })
  };
};
