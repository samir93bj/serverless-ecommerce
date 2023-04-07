import * as cdk from 'aws-cdk-lib'
import { ProductAppStack } from '../lib/productsApp-stack'
import { EcommerceApiStack } from '../lib/ecommerceApi-stack'

const app = new cdk.App()

const env: cdk.Environment = {
  account: '108107515955',
  region: 'us-east-1'
}

const tags = {
  cost: 'Ecommerce',
  team: 'DevSM'
}

const productsAppStack = new ProductAppStack(app, 'ProductsApp', {
  tags: tags,
  env: env
});

const eCommerceApiStack = new EcommerceApiStack(app, 'EcommerceApi', {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  productsAdminhHandler: productsAppStack.productsAdminHandler,
  tags: tags,
  env: env
});

eCommerceApiStack.addDependency(productsAppStack);
