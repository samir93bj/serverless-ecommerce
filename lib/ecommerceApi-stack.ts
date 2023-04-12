import * as cdk from 'aws-cdk-lib';
import * as lambdaNodeJS from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cwlogs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

interface ECommerceApiStackProps extends cdk.StackProps {
  productsFetchHandler: lambdaNodeJS.NodejsFunction
  productsAdminhHandler: lambdaNodeJS.NodejsFunction
}

export class EcommerceApiStack extends cdk.Stack {
  constructor (scope: Construct, id: string, props: ECommerceApiStackProps) {
    super(scope, id, props);

    const logGroup = new cwlogs.LogGroup(this, 'ECommerceApiLogs');
    const api = new apigateway.RestApi(this, 'ECommerceApi', {
      restApiName: 'ECommerceApi',
      cloudWatchRole: true,
      deployOptions: {
        accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
        accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
          httpMethod: true,
          ip: false,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          caller: true,
          user: false
        })
      }
    });

    this.createProductsService(api, props);
  }

  /* Create API Gateway */
  private createProductsService (api: apigateway.RestApi, props: ECommerceApiStackProps) {
    const productResource = api.root.addResource('products');
    const productIdResource = productResource.addResource('{id}');
    const productsFetchIntegration = new apigateway.LambdaIntegration(props.productsFetchHandler);
    const productsAdminIntegration = new apigateway.LambdaIntegration(props.productsAdminhHandler);

    /* GET '/products' */
    productResource.addMethod('GET', productsFetchIntegration);

    /* GET  /products/{id} */
    productIdResource.addMethod('GET', productsFetchIntegration);

    /* POST /products */
    productResource.addMethod('POST', productsAdminIntegration);

    /* PUT /products/{id} */
    productIdResource.addMethod('PUT', productsAdminIntegration);

    /* DELETE /products/{id} */
    productIdResource.addMethod('DELETE', productsAdminIntegration);
  }
};
