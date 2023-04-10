/* eslint-disable import/no-absolute-path */
import { Callback, Context } from 'aws-lambda';
import { ProductEvent } from '/opt/nodejs/productsEventsLayer';
import { DynamoDB } from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';

AWSXRay.captureAWS(require('aws-sdk'));

const envetsDdb = process.env.EVENTS_DDB!;
const ddbClient = new DynamoDB.DocumentClient();

export async function handler (event: ProductEvent, context: Context, callback: Callback): Promise<void> {
  /*
    TODO: remove this log
  */
  console.log(event);
  console.log(`Lambda Request ID: ${context.awsRequestId}`);

  await createEvent(event);

  callback(null, JSON.stringify({
    productEventCreated: true,
    message: 'OK'
  }));
};

async function createEvent (event: ProductEvent) {
  const timestamp = Date.now();
  const ttl = ~~(timestamp / 1000) + 5 * 60;

  ddbClient.put({
    TableName: envetsDdb,
    Item: {
      pk: `#product_${event.productCode}`,
      sk: `${event.eventType}#${timestamp}`,
      email: event.email,
      createdAt: timestamp,
      requestId: event.requestId,
      eventType: event.eventType,
      info: {
        product: event.productId,
        price: event.productPrice
      },
      ttl
    }
  }).promise();
};
