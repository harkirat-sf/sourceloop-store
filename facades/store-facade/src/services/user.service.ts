import { Provider, inject } from '@loopback/core';
import { juggler } from '@loopback/repository';
import { UserDto } from 'packages-interfaces';
import { UserDataSource } from '../datasources';
import { getService } from '@loopback/service-proxy';
import { User } from '../models';

type LoginDto = {
  email: string,
  password: string
}

export interface UserService {
  getUsers(): Promise<Array<User>>;
  getUserDetail(id: number): Promise<User>;
  loginUser(email: LoginDto): Promise<{access_token: string}>;
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
