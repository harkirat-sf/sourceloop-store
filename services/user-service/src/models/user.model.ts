import {Entity, model, property} from '@loopback/repository';
import { FormattedDate } from "packages-helper";
import { UserRole } from '../enums/user';

@model({
  name: "users"
})

export class User extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
  })
  name?: string;

  @property({
    type: 'string',
  })
  email?: string;

  @property({
    type: 'string',
    require: true
  })
  password?: string;

  @property({
    type: 'string',
    jsonSchema: {
    enum: Object.values(UserRole),
  },
  })
  role?: string;

  // @FormattedDate("YYYY-MM-DD hh:mm A", {
  //   type: 'Date',
  //   name: "created_at"
  // })
  @property({
    type: 'Date',
    name: "created_at"
  })
  createdAt?: Date;


  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
