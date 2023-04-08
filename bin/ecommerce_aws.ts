import * as cdk from 'aws-cdk-lib';
import { ProductAppStack } from '../lib/productsApp-stack';
import { EcommerceApiStack } from '../lib/ecommerceApi-stack';
import { ProductsAppLayersStack } from '../lib/productsApiLayers-stack';

const app = new cdk.App();

const env: cdk.Environment = {
  account: '108107515955',
  region: 'us-east-1'
};

const tags = {
  cost: 'Ecommerce',
  team: 'DevSM'
};

const productsAppLayersStack = new ProductsAppLayersStack(app, 'ProductsAppLayers', {
  tags: tags,
  env: env
});

const productsAppStack = new ProductAppStack(app, 'ProductsApp', {
  tags: tags,
  env: env
});

productsAppStack.addDependency(productsAppLayersStack);

const eCommerceApiStack = new EcommerceApiStack(app, 'EcommerceApi', {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  productsAdminhHandler: productsAppStack.productsAdminHandler,
  tags: tags,
  env: env
});

eCommerceApiStack.addDependency(productsAppStack);
