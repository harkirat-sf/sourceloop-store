import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';


const config = {
  name: "user",
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
    },
    {
      template: {
        method: 'POST',
        url: `${process.env.USER_SERVICE}users/login`,
        body: "{body}"
      },
      functions: {
        loginUser: ["body"],
      },
    }
  ],
};

@lifeCycleObserver('datasource')
export class UserDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'user';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.user', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
