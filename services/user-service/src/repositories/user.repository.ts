import { inject } from '@loopback/core';
import { DefaultCrudRepository } from '@loopback/repository';
import { PgDataSource } from '../datasources';
import { User, UserRelations } from '../models';
import * as bcrypt from "bcrypt"
import { HttpErrors } from '@loopback/rest';
import jwt from "jsonwebtoken"
export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  constructor(
    @inject('datasources.pg') dataSource: PgDataSource,
  ) {
    super(User, dataSource);
  }

  async createUser(user: Omit<User, 'id'>) {
    if (user.password) {
      user.password = await bcrypt.hash(user.password, 12)
    }
    return super.create(user);
  }

  async login(email: string, password: string) {
    const user = await super.findOne({
      where: {
        email: email
      }
    });
    if (!user) throw new HttpErrors[401];
    // verify password
    const isVerified = await bcrypt.compare(password, user.password as string);
    if (!isVerified) throw new HttpErrors[401];

    // generate new jwt token
    const payload = {
      id: user?.id,
      email: user?.email
    }

    const options = {
      expiresIn: '1h',
      algorithm: "HS256"
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, options as any);
    return {
      access_token: token
    };
  }

}
