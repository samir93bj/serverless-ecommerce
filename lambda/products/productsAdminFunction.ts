import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export async function handler (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;

  console.log(`API Gateway RequestId: ${apiRequestId}`);
  console.log(`Lambda RequestId: ${lambdaRequestId}`);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: '[Admin] Success GET Products - Ok'
    })
  };
}
