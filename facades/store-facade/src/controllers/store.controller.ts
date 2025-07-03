
import { inject } from '@loopback/core';
import { get, getModelSchemaRef, param, post, requestBody, response } from '@loopback/rest';
import { StoreService } from '../services';
import { authorize } from 'loopback4-authorization';
// import { Order } from 'order-service';

export class StoreController {
  constructor(
    @inject('services.Store') protected storeService: StoreService
  ) { }


  @authorize({ permissions: ['*'] })
  @get('/collectStore')
  async getGlobalData(): Promise<any> {
    const products = await this.storeService.getProducts();
    const orders = await this.storeService.getOrders();
    const users = await this.storeService.getUsers();
    return {
      products,
      orders,
      users
    };
  }

  @authorize({ permissions: ['*'] })
  @get('/collectUserData/{id}')
  async getUserInfo(@param.path.number('id') id: number,): Promise<any> {
    const userDetail = await this.storeService.getUserDetail(id);
    const orderRawQuery = {
      where: {
        userId: userDetail?.id
      },
      include: [{
        relation: "orderItems"
      }]
    }
    const encodedOrderFilter = encodeURIComponent(JSON.stringify(orderRawQuery));
    const orders = await this.storeService.getOrders(encodedOrderFilter);


    const productIds = await this.collectProductIds(orders);

    const productRawQuery = {
      where: {
        id: { inq: productIds }
      }
    }
    const encodedProductFilter = encodeURIComponent(JSON.stringify(productRawQuery));
    const products = await this.storeService.getProducts(encodedProductFilter);
    const orderEntities = await this.mergeItemProducts(orders, products);

    return {
      userDetail,
      entities: orderEntities
    };
  }

  async collectProductIds(orders: any): Promise<number[]> {
    const productIds: number[] = [];
    for (const order of orders) {
      for (const item of order.orderItems) {
        if (item?.productId != null) {
          productIds.push(item.productId);
        }
      }
    }
    return productIds;
  }

  async mergeItemProducts(orders: Array<any>, products: Array<any>): Promise<any> {
    const productMap = new Map(products.map(product => [product.id, product]));
    const mergedOrders: any[] = orders.map((order: any) => {
      const mergedItems: any[] = order.orderItems.map((item: any) => {
        const product = productMap.get(item.productId);
        return {
          ...item,
          product: product || null, // merge product details
        };
      });
      return {
        ...order,
        orderItems: mergedItems,
      };
    });
    return mergedOrders;
  }
}


