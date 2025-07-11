import { Provider, inject } from '@loopback/core';
import { Filter, juggler } from '@loopback/repository';
import { OrderDto } from 'packages-interfaces';
import { OrderDataSource } from '../datasources';
import { getService } from '@loopback/service-proxy';

export interface OrderService {
  getOrders(filter?: string): Promise<Array<OrderDto>>;
  createOrder(order: any): Promise<any>;
  createOrderItems(items: any): Promise<any>;
}

export class OrderProvider implements Provider<OrderService> {
  constructor(
    @inject('datasources.order')
    protected dataSource: juggler.DataSource = new OrderDataSource(),
  ) { }
  value(): Promise<OrderService> {
    return getService(this.dataSource);
  }
}