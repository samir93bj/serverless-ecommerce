import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Context } from "vm";

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

	const lambdaRequestId = context.awsRequestId;
	const apiRequestId = event.requestContext.requestId; 

	console.log(`API Gateway RequestId: ${apiRequestId}`)
	console.log(`Lambda RequestId: ${lambdaRequestId}`)

	const method = event.httpMethod
	if (event.resource === "/products") {
		if (method === 'GET') {
			console.log('GET')

			return {
				statusCode: 200,
				body: JSON.stringify({
					message: 'Success GET Products - Ok'
				})
			}
		}
	}

 return {
	statusCode: 400,
	body: JSON.stringify({
		message: 'Bad request.'
	})
 }
};