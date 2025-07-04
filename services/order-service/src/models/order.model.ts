import {Entity, model, property, hasMany} from '@loopback/repository';
import {OrderItem} from './order-item.model';

@model({
  name: "orders"
})
export class Order extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
    name: "user_id"
  })
  userId?: number;

  @property({
    type: 'string',
    required: true,
  })
  status: string;

  @property({
    type: 'number',
    name: "total_price"
  })
  totalPrice?: number;

  @hasMany(() => OrderItem, {
    keyFrom: "orderId",
    keyTo: "orderId"
  })
  orderItems: OrderItem[];

  constructor(data?: Partial<Order>) {
    super(data);
  }
}

export interface OrderRelations {
  // describe navigational properties here
}

export type OrderWithRelations = Order & OrderRelations;
