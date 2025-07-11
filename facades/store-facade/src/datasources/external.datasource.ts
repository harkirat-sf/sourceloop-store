import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'external',
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
        url: `${process.env.EXTERNAL_SERICE}products`,
      },
      functions: {
        getExternalProducts: [],
      },
    }
  ],
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class ExternalDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'external';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.external', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
