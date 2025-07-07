import { Provider, inject } from '@loopback/core';
import { juggler } from '@loopback/repository';
import { ProductDto } from 'packages-interfaces';
import { ProductDataSource } from '../datasources';
import { getService } from '@loopback/service-proxy';

export interface ProductService {
  getProducts(filter?: string): Promise<Array<ProductDto>>;

}

export class ProductProvider implements Provider<ProductService> {
  constructor(
    @inject('datasources.product')
    protected dataSource: juggler.DataSource = new ProductDataSource(),
  ) { }
  value(): Promise<ProductService> {
    return getService(this.dataSource);
  }
}
