import { Provider, inject } from '@loopback/core';
import { juggler } from '@loopback/repository';
import { UserDto } from 'packages-interfaces';
import { UserDataSource } from '../datasources';
import { getService } from '@loopback/service-proxy';

export interface UserService {
  getUsers(): Promise<Array<UserDto>>;
  getUserDetail(id: number): Promise<UserDto>;
}

export class UserProvider implements Provider<UserService> {
  constructor(
    @inject('datasources.user')
    protected dataSource: juggler.DataSource = new UserDataSource(),
  ) { }
  value(): Promise<UserService> {
    return getService(this.dataSource);
  }
}
