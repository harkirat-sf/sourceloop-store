// Uncomment these imports to begin using these cool features!

import { inject } from "@loopback/context";
import { getModelSchemaRef, post, requestBody } from "@loopback/openapi-v3";
import { INotification, NotificationBindings } from "loopback4-notifications";
import { Notification } from "../models";
import { CONTENT_TYPE, STATUS_CODE } from "@sourceloop/core";
import { authorize } from "loopback4-authorization";

// import {inject} from '@loopback/core';


type NotificationDto = {
  to: string,
  subject: string,
  content: string
}

export class NotificationController {
  constructor(
    @inject(NotificationBindings.NotificationProvider)
    private readonly notifProvider: INotification
  ) { }

  @authorize({ permissions: ["*"] })
  @post('/notifications', {
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Notification model instance',
        content: {
          [CONTENT_TYPE.JSON]: { schema: getModelSchemaRef(Notification) },
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['to', 'subject', 'content'],
            properties: {
              to: { type: 'string' },
              subject: { type: 'string' },
              content: { type: 'string' },
            },
          },
        },
      },
    })
    body: {
      to: string;
      name: string;
      subject: string;
      content: string;
    },
  ): Promise<any> {

    const notificationPayload = {
      "receiver": {
        "to": [
          {
            "id": body.to,
            "name": body.name
          }
        ]
      },
      "subject": body.subject,
      "body": body.content,
      "sentDate": new Date(),
      "type": 1,
      "options": {
        "from": "sfdev@yopmail.com",
        "subject": body.subject,
        "text": body.content
      }
    }
    return this.notifProvider.publish(notificationPayload);
  }
}
