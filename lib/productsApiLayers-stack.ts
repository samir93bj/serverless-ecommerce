import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class ProductsAppLayersStack extends cdk.Stack {
  readonly productsLayers: lambda.LayerVersion;

  constructor (scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productsLayers = new lambda.LayerVersion(this, 'ProductsLayer', {
      code: lambda.Code.fromAsset('lambda/products/layers/productsLayer'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      layerVersionName: 'ProductsLayer',
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    // eslint-disable-next-line no-new
    new ssm.StringParameter(this, 'ProductsLayersVersionArn', {
      parameterName: 'ProductsLayersVersionArn',
      stringValue: productsLayers.layerVersionArn
    });

    const productsEventsLayers = new lambda.LayerVersion(this, 'ProductEventsLayer', {
      code: lambda.Code.fromAsset('lambda/products/layers/productsEventsLayer'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      layerVersionName: 'ProductEventsLayer',
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    // eslint-disable-next-line no-new
    new ssm.StringParameter(this, 'ProductEventsLayerVersionArn', {
      parameterName: 'ProductEventsLayerVersionArn',
      stringValue: productsEventsLayers.layerVersionArn
    });
  }
}
