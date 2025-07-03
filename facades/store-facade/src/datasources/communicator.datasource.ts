import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
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
        url: `${process.env.PRODUCT_SERVICE}products?filter={filter}`,
      },
      functions: {
        getProducts: ["filter"]
      },
    },
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
        method: 'GET',
        url: `${process.env.USER_SERVICE}users`,
      },
      functions: {
        getUsers: [],
      },
    },
    {
      template: {
        method: 'GET',
        url: `${process.env.USER_SERVICE}users/{id}`,
      },
      functions: {
        getUserDetail: ["id"],
      },
    }
  ],
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class CommunicatorDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'communicator';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.communicator', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
