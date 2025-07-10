import {Provider} from '@loopback/context';
import {repository} from '@loopback/repository';
import {verify} from 'jsonwebtoken';
import {VerifyFunction} from 'loopback4-authentication';
import { RevokedTokenRepository } from '@sourceloop/core';

export class BearerTokenVerifyProvider
  implements Provider<VerifyFunction.BearerFn>
{
  constructor(
    @repository(RevokedTokenRepository)
    public revokedTokenRepository: RevokedTokenRepository,
  ) {}

  value(): VerifyFunction.BearerFn {
    return async token => {
      const user = verify(token, process.env.JWT_SECRET as string, {
        issuer: process.env.JWT_ISSUER,
      }) as any;
      return user;
    };
  }
}