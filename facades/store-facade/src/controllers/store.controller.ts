
import { inject } from '@loopback/core';
import { get, getModelSchemaRef, param, post, requestBody, response, SessionUserProfile } from '@loopback/rest';
import { authorize } from 'loopback4-authorization';
import { UserDto, ProductDto, OrderDto, OrderItemDto } from "packages-interfaces"
import { ExternalService, NotificationService, OrderService, ProductService, UserService } from '../services';
import { authenticate, AuthenticationBindings, STRATEGY } from 'loopback4-authentication';
import { Permission } from '../enums/Permission';
import { Product } from '../models/product.model';
import { collectProductIds, mergeItemProducts } from '../helpers/store';
import { ratelimit } from 'loopback4-ratelimiter';
import { LocalUserProfileDto } from '@sourceloop/authentication-service';

interface StoreDto {
  products: ProductDto[],
  orders: OrderDto[],
  users: UserDto[],
}

export interface OrderItemProductDto extends OrderItemDto {
  product?: ProductDto | null;
}

export interface EntitesDto extends OrderDto {
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
    @inject('services.External') protected externalService: ExternalService,
    @inject('services.Order') protected orderService: OrderService,
    @inject('services.Notification') protected notificationService: NotificationService,
  ) { }


  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({ permissions: [Permission.GET_STORE] })
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
  @ratelimit(false) // no rate limit will be applied to it
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
    content: { 'application/json': { schema: getModelSchemaRef(Product) } },
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
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: LocalUserProfileDto,
  ): Promise<Product> {
    const entity = await this.productService.createProduct(product);
    const notifcationPayload = {
      to: currentUser?.email,
      subject: "New Product Created!",
      content: `New Product Added
        Name=${entity?.name}`
    }
    await this.notificationService.notify(notifcationPayload)
    return entity;
  }



  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({ permissions: [Permission.CREATE_PRODUCT] })
  @post('/order')
  @response(200, {
    description: 'Product model instance',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  })
  async createOrder(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['status', 'items'],
            properties: {
              status: { type: 'string' },
              totalPrice: { type: 'number' },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  required: ['productId'],
                  properties: {
                    productId: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    })
    order: {
      status: string;
      totalPrice: string;
      items: { productId: number }[];
    },
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: any,
  ): Promise<any> {
    // Create Order
    const orderPayload = {
      userId: currentUser.id,
      status: order.status,
      totalPrice: order.totalPrice
    }

    const orderEntity = await this.orderService.createOrder(orderPayload);
    // Create order items
    const orderItemsPayload = order.items.map((item) => {
      return {
        ...item,
        orderId: orderEntity.id
      }
    });
    await this.orderService.createOrderItems(orderItemsPayload);
    // Create notification
     const notifcationPayload = {
      to: currentUser?.email,
      subject: "New Order Created!",
      content: `New Order Added`
    }
    await this.notificationService.notify(notifcationPayload)
    return orderEntity;
  }



  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({ permissions: [Permission.GET_STORE] })
  @get('/collectAllProducts')
  async getProducts(): Promise<any> {
    const [inventory, external] = await Promise.all([
      this.productService.getProducts(),
      this.externalService.getExternalProducts(),
    ]);
    return {
      inventory,
      external
    };
  }

}


