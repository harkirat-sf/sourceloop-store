import {Entity, model, property} from '@loopback/repository';

@model({
  name: "products"
})
export class Product extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'number',
    name: "base_price"
  })
  basePrice?: number;

  @property({
    type: 'number',
    name: "sale_price"
  })
  salePrice?: number;


  constructor(data?: Partial<Product>) {
    super(data);
  }
}