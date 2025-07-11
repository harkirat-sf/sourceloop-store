import { Provider, inject } from '@loopback/core';
import { juggler } from '@loopback/repository';
import { ProductDataSource } from '../datasources';
import { getService } from '@loopback/service-proxy';
import { Product } from '../models/product.model';

export interface ProductService {
  getProducts(filter?: string): Promise<Array<Product>>;
  createProduct(product: Omit<Product, 'id'>): Promise<Product>;
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
