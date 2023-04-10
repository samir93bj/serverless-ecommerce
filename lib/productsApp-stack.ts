import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJS from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

interface ProductAppStackProps extends cdk.StackProps {
  eventsDdb: dynamodb.Table
}

export class ProductAppStack extends cdk.Stack {
  readonly productsFetchHandler: lambdaNodeJS.NodejsFunction;
  readonly productsAdminHandler: lambdaNodeJS.NodejsFunction;
  readonly productDdb: dynamodb.Table;

  constructor (scope: Construct, id: string, props: ProductAppStackProps) {
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

    /* Product Layers */
    const productsLayerArn = ssm.StringParameter.valueForStringParameter(this, 'ProductsLayersVersionArn');
    const productsLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'ProductLayerVersionArn', productsLayerArn);

    /* Product Lambda Functions */
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
      },
      layers: [productsLayer],
      tracing: lambda.Tracing.ACTIVE,
      insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0
    });

    this.productDdb.grantReadData(this.productsFetchHandler);

    /* Products Events Layer */
    const productEventsLayerArn = ssm.StringParameter.valueForStringParameter(this, 'ProductEventsLayerVersionArn');
    const productEventsLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'ProductEventsLayerVersionArn', productEventsLayerArn);

    const productsEventsHandler = new lambdaNodeJS.NodejsFunction(this, 'ProductsEventsFunction', {
      functionName: 'ProductsEventsFunction',
      entry: 'lambda/products/productsEventsFunction.ts',
      handler: 'handler',
      memorySize: 128,
      timeout: cdk.Duration.seconds(2),
      bundling: {
        minify: true,
        sourceMap: true
      },
      environment: {
        EVENTS_DDB: props.eventsDdb.tableName
      },
      layers: [productEventsLayer],
      tracing: lambda.Tracing.ACTIVE,
      insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0
    });

    props.eventsDdb.grantWriteData(productsEventsHandler);

    this.productsAdminHandler = new lambdaNodeJS.NodejsFunction(this, 'ProductsAdminFunction', {
      functionName: 'ProductsAdminFunction',
      entry: 'lambda/products/productsAdminFunction.ts',
      handler: 'handler',
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
      bundling: {
        minify: true,
        sourceMap: true
      },
      environment: {
        PRODUCTS_DDB: this.productDdb.tableName,
        PRODUCTS_VENTS_FUNCTION_NAME: productsEventsHandler.functionName
      },
      layers: [productsLayer, productEventsLayer],
      tracing: lambda.Tracing.ACTIVE,
      insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0
    });

    this.productDdb.grantWriteData(this.productsAdminHandler);
    productsEventsHandler.grantInvoke(this.productsAdminHandler);
  }
};
