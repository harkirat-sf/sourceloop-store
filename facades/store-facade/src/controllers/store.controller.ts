
import { inject } from '@loopback/core';
import { get, getModelSchemaRef, param, post, requestBody, response } from '@loopback/rest';
import { authorize } from 'loopback4-authorization';
import {UserDto, ProductDto, OrderDto, OrderItemDto} from "packages-interfaces"
import { OrderService, ProductService, UserService } from '../services';
import { authenticate, STRATEGY } from 'loopback4-authentication';
import { Permission } from '../enums/Permission';
import { Product } from '../models/product.model';
import { collectProductIds, mergeItemProducts } from '../helpers/store';

  interface StoreDto {
    products: ProductDto[],
    orders: OrderDto[],
    users: UserDto[],
  }

  export interface OrderItemProductDto extends OrderItemDto{
    product?: ProductDto | null;
  }

  export interface EntitesDto extends OrderDto{
    orderItems: OrderItemProductDto[]
  }

  interface UserInfoDto {
    detail: UserDto,
    entities?: EntitesDto[]
  }


export class StoreController {
  constructor(
    @inject('services.User') protected userService: UserService,
    @inject('services.Product') protected productService: ProductService,
    @inject('services.Order') protected orderService: OrderService,
  ) { }


  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({permissions: [Permission.GET_STORE]})
  @get('/collectStore')
  async getGlobalData(): Promise<StoreDto> {
      const [products, orders, users] = await Promise.all([
        this.productService.getProducts(),
        this.orderService.getOrders(),
        this.userService.getUsers()
      ]);
    return {
      products,
      orders,
      users
    };
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({ permissions: ['*'] })
  @get('/collectUserData/{id}')
  async getUserInfo(@param.path.number('id') id: number,): Promise<UserInfoDto> {
    const userDetail = await this.userService.getUserDetail(id);
    const orderRawQuery = {
      where: {
        userId: userDetail?.id
      },
      include: [{
        relation: "orderItems"
      }]
    }
    const encodedOrderFilter = encodeURIComponent(JSON.stringify(orderRawQuery));
    const orders = await this.orderService.getOrders(encodedOrderFilter);
    const productIds = await collectProductIds(orders);

    const productRawQuery = {
      where: {
        id: { inq: productIds }
      }
    }
    const encodedProductFilter = encodeURIComponent(JSON.stringify(productRawQuery));
    const products = await this.productService.getProducts(encodedProductFilter);
    const orderEntities = await mergeItemProducts(orders, products);

    return {
      detail: userDetail,
      entities: orderEntities
    };
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({ permissions: [Permission.CREATE_PRODUCT] })
  @post('/product')
  @response(200, {
    description: 'Product model instance',
    content: {'application/json': {schema: getModelSchemaRef(Product)}},
  })
  async createProduct(
     @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Product, {
            title: 'NewProduct',
            exclude: ['id'],
          }),
        },
      },
    })
    product: Omit<Product, 'id'>,
  ): Promise<Product> {
    return this.productService.createProduct(product)
  }

}


