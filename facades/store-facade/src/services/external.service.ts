import { inject, Provider } from "@loopback/context";
import { juggler } from "@loopback/repository";
import { ExternalDataSource } from "../datasources";
import { getService } from "@loopback/service-proxy";



export interface ExternalService {
  getExternalProducts(): Promise<any>;
}

export class ExternalProvider implements Provider<ExternalService> {
  constructor(
    @inject('datasources.external')
    protected dataSource: juggler.DataSource = new ExternalDataSource,
  ) { }

  value(): Promise<ExternalService> {
    return getService(this.dataSource);
  }
  /*
   * Add service methods here
   */
}
