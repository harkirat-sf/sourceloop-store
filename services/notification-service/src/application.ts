import { BootMixin } from '@loopback/boot';
import { ApplicationConfig } from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import * as dotenv from 'dotenv';
import * as dotenvExt from 'dotenv-extended';
import { AuthenticationComponent, Strategies } from 'loopback4-authentication';
import {
  AuthorizationBindings,
  AuthorizationComponent,
} from 'loopback4-authorization';
import {
  ServiceSequence,
  SFCoreBindings,
  BearerVerifierBindings,
  BearerVerifierComponent,
  BearerVerifierConfig,
  BearerVerifierType,
  SECURITY_SCHEME_SPEC,
} from '@sourceloop/core';
import { NotificationServiceComponent } from '@sourceloop/notification-service'
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication } from '@loopback/rest';
import { ServiceMixin } from '@loopback/service-proxy';
import path from 'path';
import * as openapi from './openapi.json';
import { NotificationBindings } from 'loopback4-notifications';
import { NodemailerBindings, NodemailerProvider } from 'loopback4-notifications/nodemailer';
import { BearerTokenVerifyProvider } from './provider/bearer-token-verify';

export { ApplicationConfig };

export class NotificationServiceApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    const port = 3000;
    dotenv.config();
    dotenvExt.load({
      schema: '.env.example',
      errorOnMissing: process.env.NODE_ENV !== 'test',
      includeProcessEnv: true,
    });
    options.rest = options.rest ?? {};
    options.rest.basePath = process.env.BASE_PATH ?? '';
    options.rest.port = +(process.env.PORT ?? port);
    options.rest.host = process.env.HOST;
    options.rest.openApiSpec = {
      endpointMapping: {
        [`${options.rest.basePath}/openapi.json`]: {
          version: '3.0.0',
          format: 'json',
        },
      },
    };

    super(options);

    // To check if monitoring is enabled from env or not
    const enableObf = !!+(process.env.ENABLE_OBF ?? 0);
    // To check if authorization is enabled for swagger stats or not
    const authentication =
      process.env.SWAGGER_USER && process.env.SWAGGER_PASSWORD ? true : false;
    const obj = {
      enableObf,
      obfPath: process.env.OBF_PATH ?? '/obf',
      openapiSpec: openapi,
      authentication: authentication,
      swaggerUsername: process.env.SWAGGER_USER,
      swaggerPassword: process.env.SWAGGER_PASSWORD,

    }
    this.bind(SFCoreBindings.config).to(obj);

    // Set up the custom sequence
    this.sequence(ServiceSequence);

    // Add authentication component
    this.component(AuthenticationComponent);

    this.component(NotificationServiceComponent);
     this.bind(NodemailerBindings.Config).to({
      pool: true,
      maxConnections: 100,
      url: '',
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      secure: false,
      auth: {
        user: '6f1bd8bb0c5270',
        pass: '31c85e75cda994',
      },
      tls: {
        rejectUnauthorized: true,
      },
    });
    this.bind(NotificationBindings.EmailProvider).toProvider(
      NodemailerProvider,
    );
    
    this.bind(Strategies.Passport.BEARER_TOKEN_VERIFIER).toProvider(
      BearerTokenVerifyProvider,
    );

    // Add bearer verifier component
    this.bind(BearerVerifierBindings.Config).to({
      type: BearerVerifierType.service,
      useSymmetricEncryption:true,
    } as BearerVerifierConfig);
    this.component(BearerVerifierComponent);

    // Add authorization component
    this.bind(AuthorizationBindings.CONFIG).to({
      allowAlwaysPaths: ['/explorer', '/openapi.json'],
    });
    this.component(AuthorizationComponent);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });

    this.component(RestExplorerComponent);


    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    this.api({
      openapi: '3.0.0',
      info: {
        title: 'notification-service',
        version: '1.0.0',
      },
      paths: {},
      components: {
        securitySchemes: SECURITY_SCHEME_SPEC,
      },
      servers: [{ url: '/' }],
    });
  }
}
