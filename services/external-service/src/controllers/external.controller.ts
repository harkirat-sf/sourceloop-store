import axios from "axios";
import {
  get,
  response,
} from '@loopback/rest';
import { STATUS_CODE } from "@sourceloop/core";
import { authorize } from "loopback4-authorization";


export class ExternalController {
  constructor() {}

    @authorize({permissions: ["*"]})
   @get('/products', {
      responses: {
        [STATUS_CODE.OK]: {},
      },
    })
  async getData(): Promise<any> {
    try {
      const externalApiUrl = 'https://dummyjson.com/products?limit=10';
      const response = await axios.get(externalApiUrl);
      return response.data.products;
    } catch (err) {
      return {error: 'Failed to fetch data from external API'};
    }
  }
}
