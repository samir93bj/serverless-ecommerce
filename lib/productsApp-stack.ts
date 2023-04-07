import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJS from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

import { Construct } from 'constructs';

export class ProductAppStack extends cdk.Stack {
	readonly productsFetchHandler: lambdaNodeJS.NodejsFunction
	readonly productDdb: dynamodb.Table

	constructor(scope: Construct, id: string, props?: cdk.StackProps ) {
		super(scope, id, props);

		this.productDdb = new dynamodb.Table(this, 'ProductDdb', {
			tableName: 'products',
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			partitionKey: {
				name: 'id',
				type: dynamodb.AttributeType.STRING
			},
			billingMode: dynamodb.BillingMode.PROVISIONED,
			readCapacity: 1,
			writeCapacity: 1
		});

		this.productsFetchHandler = new lambdaNodeJS.NodejsFunction(this, 'ProductsFetchFunction', {
			functionName: 'ProductsFetchFunction',
			entry: 'lambda/products/productsFetchFunction.ts',
			handler: 'handler',
			memorySize: 128,
			timeout: cdk.Duration.seconds(5),
			bundling: {
					minify: true,
					sourceMap: true
			},
			environment: {
				PRODUCTS_DDB: this.productDdb.tableName
			}
		})

		this.productDdb.grantReadData(this.productsFetchHandler)
	}
}