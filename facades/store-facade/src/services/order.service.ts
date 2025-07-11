import { Provider, inject } from '@loopback/core';
import { Filter, juggler } from '@loopback/repository';
import { OrderDataSource } from '../datasources';
import { getService } from '@loopback/service-proxy';
import { Order } from '../models';

export interface OrderService {
  getOrders(filter?: string): Promise<Array<Order>>;
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