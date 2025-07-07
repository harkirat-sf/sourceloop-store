import {inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import { CommunicatorDataSource } from '../datasources';
import { AnyObject, Filter, juggler } from '@loopback/repository';
import { UserDto, OrderDto, ProductDto } from "packages-interfaces";


export interface StoreService {
  getProducts(filter?: string): Promise<Array<ProductDto>>;
  getOrders(filter?: Filter): Promise<Array<OrderDto>>;
  getUsers(): Promise<Array<UserDto>>;
  getUserDetail(id: number): Promise<UserDto>;
}

export class StoreProvider implements Provider<StoreService> {
  constructor(
    @inject('datasources.communicator')
     protected dataSource: juggler.DataSource = new CommunicatorDataSource(),
  ) {}

  value(): Promise<StoreService> {
    return getService(this.dataSource);
  }
}
