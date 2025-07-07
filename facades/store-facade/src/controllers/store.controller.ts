
import { inject } from '@loopback/core';
import { get, param } from '@loopback/rest';
import { StoreService } from '../services';
import { authorize } from 'loopback4-authorization';

import {UserDto, ProductDto, OrderDto, OrderItemDto} from "packages-interfaces"

  interface StoreDto {
    products: ProductDto[],
    orders: OrderDto[],
    users: UserDto[],
  }

  interface OrderItemProductDto extends OrderItemDto{
    product?: ProductDto | null;
  }

  interface EntitesDto extends OrderDto{
    orderItems: OrderItemProductDto[]
  }

  interface UserInfoDto {
    detail: UserDto,
    entities?: EntitesDto[]
  }


export class StoreController {
  constructor(
    @inject('services.Store') protected storeService: StoreService
  ) { }



  @authorize({ permissions: ['*'] })
  @get('/collectStore')
  async getGlobalData(): Promise<StoreDto> {
      const [products, orders, users] = await Promise.all([
        this.storeService.getProducts(),
        this.storeService.getOrders(),
        this.storeService.getUsers()
      ]);
    return {
      products,
      orders,
      users
    };
  }

  @authorize({ permissions: ['*'] })
  @get('/collectUserData/{id}')
  async getUserInfo(@param.path.number('id') id: number,): Promise<UserInfoDto> {
    const userDetail = await this.storeService.getUserDetail(id);
    const orderRawQuery = {
      where: {
        userId: userDetail?.id
      },
      include: [{
        relation: "orderItems"
      }]
    }
    // const encodedOrderFilter = encodeURIComponent(JSON.stringify(orderRawQuery));
    const orders = await this.storeService.getOrders(orderRawQuery);
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
      detail: userDetail,
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

  async mergeItemProducts(orders: Array<OrderDto>, products: Array<ProductDto>): Promise<EntitesDto[]> {
    const productMap = new Map(products.map(product => [product.id, product]));
    const mergedOrders: EntitesDto[] = orders.map(order => {
      const mergedItems: OrderItemProductDto[] = (order as EntitesDto).orderItems.map(item => {
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


