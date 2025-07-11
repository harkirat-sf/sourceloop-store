import { inject, lifeCycleObserver, LifeCycleObserver } from '@loopback/core';
import { juggler } from '@loopback/repository';

const config = {
  name: 'order',
  connector: 'rest',
  crud: false,
  options: {
    headers: {
      accept: 'application/json',
    },
  },
  operations: [
    {
      template: {
        method: 'GET',
        url: `${process.env.ORDER_SERVICE}orders?filter={filter}`,
      },
      functions: {
        getOrders: ["filter"],
      },
    },
    {
      template: {
        method: 'POST',
        url: `${process.env.ORDER_SERVICE}orders`,
        body: '{body}',
      },
      functions: {
        createOrder: ["body"]
      },
    },
    {
      template: {
        method: 'POST',
        url: `${process.env.ORDER_SERVICE}order-items/bulk`,
        body: '{body}',
      },
      functions: {
        createOrderItems: ["body"]
      },
    }
  ],
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class OrderDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'order';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.order', { optional: true })
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
