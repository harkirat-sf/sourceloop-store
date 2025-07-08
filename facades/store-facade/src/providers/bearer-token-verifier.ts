import {Provider} from '@loopback/context';
import {repository} from '@loopback/repository';
import {verify} from 'jsonwebtoken';
import {VerifyFunction} from 'loopback4-authentication';

import {User} from '../models/user.model';
// import { RevokedTokenRepository } from '@sourceloop/core';
import { HttpErrors } from '@loopback/rest';
import { RevokedTokenRepository } from '../repositories';

export class BearerTokenVerifyProvider
  implements Provider<VerifyFunction.BearerFn>
{
  constructor(
    @repository(RevokedTokenRepository)
    public revokedTokenRepository: RevokedTokenRepository,
  ) {}

  value(): VerifyFunction.BearerFn {
    return async token => {
      // if (token && (await this.¸.get(token))) {
      //   throw new HttpErrors.Unauthorized('Token Revoked');
      // }
      // throw new HttpErrors.Unauthorized('Testing..');

      const user = verify(token, process.env.JWT_SECRET as string, {
        issuer: process.env.JWT_ISSUER,
      }) as User;

      console.log("user ===>", user)
      return user;
    };
  }
}