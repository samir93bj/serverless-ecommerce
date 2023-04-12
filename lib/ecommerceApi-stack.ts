import * as cdk from 'aws-cdk-lib';
import * as lambdaNodeJS from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cwlogs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

interface ECommerceApiStackProps extends cdk.StackProps {
  productsFetchHandler: lambdaNodeJS.NodejsFunction;
  productsAdminhHandler: lambdaNodeJS.NodejsFunction;
  ordersHandler: lambdaNodeJS.NodejsFunction;
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
    this.createOrdersService(api, props);
  }

  /* Create API Gateway Products */
  private createProductsService (api: apigateway.RestApi, props: ECommerceApiStackProps) {
    const productsFetchIntegration = new apigateway.LambdaIntegration(props.productsFetchHandler);
    const productsAdminIntegration = new apigateway.LambdaIntegration(props.productsAdminhHandler);
    const productResource = api.root.addResource('products');
    const productIdResource = productResource.addResource('{id}');

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

  /* Create API Gateway Orders */
  private createOrdersService (api: apigateway.RestApi, props: ECommerceApiStackProps) {
    const orderIntegration = new apigateway.LambdaIntegration(props.ordersHandler);
    const orderResource = api.root.addResource('orders');

    orderResource.addMethod('GET', orderIntegration);

    orderResource.addMethod('POST', orderIntegration);

    /* DELETE /orders?email=matilde@siecola.com.br&orderId=123 */
    const orderDeleteValidaor = new apigateway.RequestValidator(this, 'OrderDeletionValidator', {
      restApi: api,
      requestValidatorName: 'OrderDeletionValidator',
      validateRequestParameters: true
    });

    orderResource.addMethod('DELETE', orderIntegration, {
      requestParameters: {
        'method.request.querystring.email': true,
        'method.request.querystring.orderId': true
      },
      requestValidator: orderDeleteValidaor
    });
  }
};
