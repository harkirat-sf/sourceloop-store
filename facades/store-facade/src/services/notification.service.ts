import { Provider, inject } from '@loopback/core';
import { juggler } from '@loopback/repository';
import { NotificationDataSource } from '../datasources';
import { getService } from '@loopback/service-proxy';

type NotificationDto = {
  to: string,
  subject: string,
  content: string
}
export interface NotificationService {
  notify(payload?: NotificationDto): Promise<any>;
}

export class NotificationProvider implements Provider<NotificationService> {
  constructor(
    @inject('datasources.notification')
    protected dataSource: juggler.DataSource = new NotificationDataSource,
  ) { }

  value(): Promise<NotificationService> {
    return getService(this.dataSource);
  }
  
}
