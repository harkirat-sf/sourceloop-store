import {inject, Provider} from '@loopback/core';
import {getService} from '@loopback/service-proxy';
import { CommunicatorDataSource } from '../datasources';
import { AnyObject, juggler } from '@loopback/repository';


export interface StoreService {
  getProducts(filter?: string): Promise<any[]>;
  getOrders(filter?: string): Promise<any[]>;
  getUsers(): Promise<any[]>;
  getUserDetail(id: number): Promise<AnyObject>;
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
