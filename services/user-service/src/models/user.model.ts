import {Entity, model, property} from '@loopback/repository';
import { FormattedDate } from "packages-helper";

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
  })
  password?: string;

  @property({
    type: 'string',
  })
  role?: string;

  @FormattedDate("YYYY-MM-DD hh:mm A", {
     type: 'date',
    name: "created_at"
  })
  createdAt?: string;


  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
