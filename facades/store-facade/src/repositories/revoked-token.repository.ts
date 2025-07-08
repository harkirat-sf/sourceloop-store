import { inject } from '@loopback/core';
import { DefaultKeyValueRepository } from '@loopback/repository';
import { RedisDataSource } from '../datasources/redis.datasource';
import { RevokedToken } from '../models/revoked-token.model';

export class RevokedTokenRepository extends DefaultKeyValueRepository<
  RevokedToken
> {
  constructor(
    @inject('datasources.AuthDB', { optional: true }) dataSource: RedisDataSource,
  ) {
    super(RevokedToken, dataSource);
  }
}