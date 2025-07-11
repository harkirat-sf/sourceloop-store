
import { inject } from '@loopback/core';
import { get, getModelSchemaRef, HttpErrors, param, post, requestBody, response } from '@loopback/rest';
import { authorize } from 'loopback4-authorization';
import { ExternalService, NotificationService, OrderService, ProductService, UserService } from '../services';
import { authenticate, AuthenticationBindings, STRATEGY } from 'loopback4-authentication';
import { Permission } from '../enums/Permission';
import { Product } from '../models/product.model';
import { collectProductIds, mergeItemProducts } from '../helpers/store';
import { ratelimit } from 'loopback4-ratelimiter';
import { LocalUserProfileDto } from '@sourceloop/authentication-service';
import { STATUS_CODE } from '@sourceloop/core';
import { Order, User } from '../models';
import { safeFetch } from "packages-helper";
type StoreDto = {
  products: Product[],
  orders: Order[],
  users: User[],
}

export class StoreController {
  constructor(
    @inject('services.User') protected userService: UserService,
    @inject('services.Product') protected productService: ProductService,
    @inject('services.External') protected externalService: ExternalService,
    @inject('services.Order') protected orderService: OrderService,
    @inject('services.Notification') protected notificationService: NotificationService,
  ) { }

  // @authorize({ permissions: ["*"] })
  // @post('/login', {
  //   responses: {
  //     [STATUS_CODE.OK]: {
  //       description: 'Login successful',
  //       content: {
  //         'application/json': {
  //           schema: {
  //             type: 'object',
  //             properties: {
  //               access_token: { type: 'string' },
  //             },
  //           },
  //         },
  //       },
  //     },
  //     [STATUS_CODE.UNAUTHORISED]: {
  //       description: 'Invalid credentials',
  //     },
  //     [STATUS_CODE.INTERNAL_SERVER_ERROR]: {
  //       description: 'Internal server error',
  //     },
  //   }
  // })
  // async login(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: {
  //           type: 'object',
  //           required: ['email', 'password'],
  //           properties: {
  //             email: { type: 'string' },
  //             password: { type: 'string' },
  //           },
  //         },
  //       },
  //     },
  //   })
  //   payload: {
  //     email: string;
  //     password: string;
  //   },
  // ): Promise<{ access_token: string }> {
  //   try {
  //     return this.userService.loginUser(payload);
  //   } catch (err) {
  //     throw new HttpErrors.InternalServerError('Login failed, please try again later');
  //   }
  // }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({ permissions: [Permission.GET_STORE] })
  @get('/collectStore')
  async getGlobalData(): Promise<StoreDto> {
    const [productsResult, ordersResult, usersResult] = await Promise.allSettled([
      this.productService.getProducts(),
      this.orderService.getOrders(),
      this.userService.getUsers()
    ]);
    const products = productsResult.status === 'fulfilled' ? productsResult.value : [];
    const orders = ordersResult.status === 'fulfilled' ? ordersResult.value : [];
    const users = usersResult.status === 'fulfilled' ? usersResult.value : [];
    return {
      products,
      orders,
      users
    };
  }

  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({ permissions: [Permission.GET_USER_CART] })
  // @ratelimit(false) // no rate limit will be applied to it
  @get('/collectUserData')
  async getUserInfo(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: any,
  ): Promise<any> {
    const userDetail = await safeFetch(() => this.userService.getUserDetail(currentUser.id));
    const userId = userDetail?.id ?? -1;
    const orderRawQuery = {
      where: {
        userId: userId
      },
      include: [{
        relation: "orderItems"
      }]
    }
    const encodedOrderFilter = encodeURIComponent(JSON.stringify(orderRawQuery));
    const orders = await safeFetch(() => this.orderService.getOrders(encodedOrderFilter)) ?? [];
    const productIds = await collectProductIds(orders);
    const productRawQuery = {
      where: {
        id: { inq: productIds }
      }
    }
    const encodedProductFilter = encodeURIComponent(JSON.stringify(productRawQuery));
    const products = await safeFetch(() => this.productService.getProducts(encodedProductFilter)) ?? [];
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
    await safeFetch(() => this.notificationService.notify(notifcationPayload));
    return entity;
  }



  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({ permissions: [Permission.CREATE_ORDER] })
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
    await safeFetch(() => this.notificationService.notify(notifcationPayload));
    return orderEntity;
  }


  @authenticate(STRATEGY.BEARER, {
    passReqToCallback: true,
  })
  @authorize({ permissions: [Permission.GET_PRODUCTS] })
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


