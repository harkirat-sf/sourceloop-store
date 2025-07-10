// Uncomment these imports to begin using these cool features!

import { inject } from "@loopback/context";
import { getModelSchemaRef, post, requestBody } from "@loopback/openapi-v3";
import { INotification, NotificationBindings } from "loopback4-notifications";
import { Notification } from "../models";
import { CONTENT_TYPE, STATUS_CODE } from "@sourceloop/core";
import { authorize } from "loopback4-authorization";

// import {inject} from '@loopback/core';


export class NotificationController {
  constructor( 
    @inject(NotificationBindings.NotificationProvider)
    private readonly notifProvider: INotification
  ) {}

    @authorize({permissions: ["*"]})
    @post('/notifications', {
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Notification model instance',
        content: {
          [CONTENT_TYPE.JSON]: {schema: getModelSchemaRef(Notification)},
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        [CONTENT_TYPE.JSON]: {
          schema: getModelSchemaRef(Notification, {exclude: ['id']}),
        },
      },
    })
    notification: Omit<Notification, 'id'>,
  ): Promise<any> {
    await this.notifProvider.publish(notification);
  }
}
