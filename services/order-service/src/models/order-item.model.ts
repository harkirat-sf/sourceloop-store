import {Entity, model, property} from '@loopback/repository';

@model({
  name: "order_items"
})

export class OrderItem extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
    name: "order_id"
  })
  orderId?: number;

  @property({
    type: 'number',
    name: "product_id"
  })
  productId?: number;


  constructor(data?: Partial<OrderItem>) {
    super(data);
  }
}

export interface OrderItemRelations {
  // describe navigational properties here
}

export type OrderItemWithRelations = OrderItem & OrderItemRelations;
