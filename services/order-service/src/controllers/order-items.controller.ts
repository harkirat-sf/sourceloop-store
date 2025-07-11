import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import { OrderItem } from '../models';
import { OrderItemRepository } from '../repositories';
import { authorize } from 'loopback4-authorization';

export class OrderItemsController {
  constructor(
    @repository(OrderItemRepository)
    public orderItemRepository: OrderItemRepository,
  ) { }

  @authorize({ permissions: ['*'] })
  @post('/order-items')
  @response(200, {
    description: 'OrderItem model instance',
    content: { 'application/json': { schema: getModelSchemaRef(OrderItem) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderItem, {
            title: 'NewOrderItem',
            exclude: ['id'],
          }),
        },
      },
    })
    orderItem: Omit<OrderItem, 'id'>,
  ): Promise<OrderItem> {
    return this.orderItemRepository.create(orderItem);
  }

  @authorize({ permissions: ['*'] })
  @post('/order-items/bulk')
  @response(200, {
    description: 'OrderItem model instance',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(OrderItem),
        },
      },
    },
  })
  async createBulk(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: getModelSchemaRef(OrderItem, {
              title: 'NewOrderItem',
              exclude: ['id'],
            }),
          },
        },
      },
    })
    orderItems: Omit<OrderItem, 'id'>[],
  ): Promise<OrderItem[]> {
    return this.orderItemRepository.createAll(orderItems);
  }

  @get('/order-items/count')
  @response(200, {
    description: 'OrderItem model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(
    @param.where(OrderItem) where?: Where<OrderItem>,
  ): Promise<Count> {
    return this.orderItemRepository.count(where);
  }
  @authorize({ permissions: ['*'] })
  @get('/order-items')
  @response(200, {
    description: 'Array of OrderItem model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(OrderItem, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(OrderItem) filter?: Filter<OrderItem>,
  ): Promise<OrderItem[]> {
    return this.orderItemRepository.find(filter);
  }

  @patch('/order-items')
  @response(200, {
    description: 'OrderItem PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderItem, { partial: true }),
        },
      },
    })
    orderItem: OrderItem,
    @param.where(OrderItem) where?: Where<OrderItem>,
  ): Promise<Count> {
    return this.orderItemRepository.updateAll(orderItem, where);
  }

  @get('/order-items/{id}')
  @response(200, {
    description: 'OrderItem model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(OrderItem, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(OrderItem, { exclude: 'where' }) filter?: FilterExcludingWhere<OrderItem>
  ): Promise<OrderItem> {
    return this.orderItemRepository.findById(id, filter);
  }

  @patch('/order-items/{id}')
  @response(204, {
    description: 'OrderItem PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(OrderItem, { partial: true }),
        },
      },
    })
    orderItem: OrderItem,
  ): Promise<void> {
    await this.orderItemRepository.updateById(id, orderItem);
  }

  @put('/order-items/{id}')
  @response(204, {
    description: 'OrderItem PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() orderItem: OrderItem,
  ): Promise<void> {
    await this.orderItemRepository.replaceById(id, orderItem);
  }

  @del('/order-items/{id}')
  @response(204, {
    description: 'OrderItem DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.orderItemRepository.deleteById(id);
  }
}
