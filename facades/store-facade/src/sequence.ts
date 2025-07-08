import { inject } from "@loopback/context";
import { FindRoute, HttpErrors, InvokeMethod, ParseParams, Reject, RequestContext, Send, SequenceActions, SequenceHandler } from "@loopback/rest";
import { AuthorizationBindings, AuthUser } from "@sourceloop/authentication-service";
import { AuthenticateFn, AuthenticationBindings } from "loopback4-authentication";
import { AuthorizeErrorKeys, AuthorizeFn } from "loopback4-authorization";
import { RolePermissions } from "./mapper/RoleMapper";
import { UserRole } from "./enums/Role";

export class MySequence implements SequenceHandler {
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
    @inject(AuthenticationBindings.USER_AUTH_ACTION)
    protected authenticateRequest: AuthenticateFn<AuthUser>,
     @inject(AuthorizationBindings.AUTHORIZE_ACTION)
    protected checkAuthorisation: AuthorizeFn,
  ) {}

  async handle(context: RequestContext) {
    try {
      const {request, response} = context;

      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);
      request.body = args[args.length - 1];
      // console.log("______>")
      const authUser: AuthUser = await this.authenticateRequest(request, response);
      const userPermissions = RolePermissions[authUser?.role as UserRole] ?? [];
      const isAccessAllowed: boolean = await this.checkAuthorisation(
        userPermissions,
        request,
      );

      if (!isAccessAllowed) {
        throw new HttpErrors.Forbidden(AuthorizeErrorKeys.NotAllowedAccess);
      }

      const result = await this.invoke(route, args);
      this.send(response, result);
    } catch (err) {
      this.reject(context, err);
    }
  }
}
