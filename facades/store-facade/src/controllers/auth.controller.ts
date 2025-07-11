// Uncomment these imports to begin using these cool features!

import { inject } from "@loopback/context";
import { authorize } from "loopback4-authorization";
import { HttpErrors, param, post, requestBody } from '@loopback/rest';
import { STATUS_CODE } from "@sourceloop/core";
import { UserService } from "../services";

// import {inject} from '@loopback/core';


export class AuthController {
  constructor(
        @inject('services.User') protected userService: UserService,
  ) {}

   @authorize({ permissions: ["*"] })
    @post('/login', {
       security: [],
      responses: {
        [STATUS_CODE.OK]: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  access_token: { type: 'string' },
                },
              },
            },
          },
        },
        [STATUS_CODE.UNAUTHORISED]: {
          description: 'Invalid credentials',
        },
        [STATUS_CODE.INTERNAL_SERVER_ERROR]: {
          description: 'Internal server error',
        },
      }
    })
    async login(
      @requestBody({
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string' },
                password: { type: 'string' },
              },
            },
          },
        },
      })
      payload: {
        email: string;
        password: string;
      },
    ): Promise<{ access_token: string }> {
      try {
        return this.userService.loginUser(payload);
      } catch (err) {
        throw new HttpErrors.InternalServerError('Login failed, please try again later');
      }
    }
}
