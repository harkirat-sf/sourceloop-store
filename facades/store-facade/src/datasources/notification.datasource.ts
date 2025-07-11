import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'notification',
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
        method: 'POST',
        url: `${process.env.NOTIFICATION_SERVICE}notifications`,
        body: '{body}',
      },
      functions: {
        notify: ["body"],
      },
    }
  ],
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class NotificationDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'notification';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.notification', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
