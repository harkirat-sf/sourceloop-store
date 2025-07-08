import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'product',
  connector: 'rest',
  baseURL: '',
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
        method: 'POST',
        url: `${process.env.PRODUCT_SERVICE}products`,
        body: '{body}',
      },
      functions: {
        createProduct: ["body"]
      },
    }
  ],
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class ProductDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'product';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.product', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
