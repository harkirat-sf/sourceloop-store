import {get} from '@loopback/openapi-v3';
import * as fs from 'fs';
import * as path from 'path';
import {inject} from '@loopback/context';
import {RestBindings, Response} from '@loopback/rest';
import {authorize} from 'loopback4-authorization';
import {ratelimit} from 'loopback4-ratelimiter';
import {rateLimitKeyGenPublic, STATUS_CODE} from '@sourceloop/core';

export class HomePageController {
  private readonly html: string;
  constructor(
    @inject(RestBindings.Http.RESPONSE)
    private readonly response: Response,
  ) {
    this.html = fs.readFileSync(
      path.join(__dirname, '../../public/index.html'),
      'utf-8',
    );
    // Replace base path placeholder from env
    this.html = this.html.replace(
      /\$\{basePath\}/g,
      process.env.BASE_PATH ?? '',
    );
  }

      @ratelimit(true, {
      max: parseInt(process.env.PUBLIC_API_MAX_ATTEMPTS ?? '5'),
      keyGenerator: rateLimitKeyGenPublic,
    })
    @authorize({permissions: ['*']})
  @get('/', {
    responses: {
      [STATUS_CODE.OK]: {
        description: 'Home Page',
        content: {'text/html': {schema: {type: 'string'}}},
      },
    },
  })
  homePage() {
    this.response
      .status(STATUS_CODE.OK)
      .contentType('html')
      .send(this.html);
    return this.response;
  }
}