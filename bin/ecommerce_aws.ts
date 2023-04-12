import * as cdk from 'aws-cdk-lib';
import { ProductAppStack } from '../lib/productsApp-stack';
import { EcommerceApiStack } from '../lib/ecommerceApi-stack';
import { ProductsAppLayersStack } from '../lib/productsApiLayers-stack';
import { EventsDdbStack } from '../lib/eventDdb-stack';
import { OrdersAppLayersStack } from '../lib/ordersAppLayers-stack';
import { OrdersAppStack } from '../lib/ordersApp-stack';

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
  tags,
  env
});

const eventsDdbStack = new EventsDdbStack(app, 'EventsDdb', {
  tags,
  env
});

const productsAppStack = new ProductAppStack(app, 'ProductsApp', {
  eventsDdb: eventsDdbStack.table,
  tags,
  env
});

productsAppStack.addDependency(productsAppLayersStack);
productsAppStack.addDependency(eventsDdbStack);

const ordersAppLayersStack = new OrdersAppLayersStack(app, 'OrdersAppLayers', {
  tags,
  env
});

const ordersAppStack = new OrdersAppStack(app, 'OrdersApp', {
  tags,
  env,
  productsDdb: productsAppStack.productDdb
});

ordersAppStack.addDependency(productsAppStack);
ordersAppStack.addDependency(ordersAppLayersStack);

const eCommerceApiStack = new EcommerceApiStack(app, 'EcommerceApi', {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  productsAdminhHandler: productsAppStack.productsAdminHandler,
  ordersHandler: ordersAppStack.ordersHandler,
  tags,
  env
});

eCommerceApiStack.addDependency(productsAppStack);
eCommerceApiStack.addDependency(ordersAppStack);
