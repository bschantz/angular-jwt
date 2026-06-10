import { DOCUMENT } from "@angular/common";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { JwtHelperService } from "./jwthelper.service";
import { JWT_OPTIONS } from "./jwtoptions.token";

import { defer, Observable, of } from "rxjs";
import { map, mergeMap } from "rxjs/operators";

const fromPromiseOrValue = <T>(input: T | Promise<T>) => {
  if (input instanceof Promise) {
    return defer(() => input);
  }
  return of(input);
};
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  tokenGetter: (request?: HttpRequest<unknown>) => string | null | Promise<string | null>;
  headerName: string;
  authScheme: string | ((request?: HttpRequest<unknown>) => string);
  allowedDomains: Array<string | RegExp>;
  disallowedRoutes: Array<string | RegExp>;
  throwNoTokenError: boolean;
  skipWhenExpired: boolean;
  standardPorts: string[] = ["80", "443"];

  jwtHelper = inject(JwtHelperService);
  config = inject(JWT_OPTIONS);

  private document = inject(DOCUMENT);

  constructor() {
    this.tokenGetter = this.config.tokenGetter;
    this.headerName = this.config.headerName || "Authorization";
    this.authScheme = this.config.authScheme || this.config.authScheme === "" ? this.config.authScheme : "Bearer ";
    this.allowedDomains = this.config.allowedDomains || [];
    this.disallowedRoutes = this.config.disallowedRoutes || [];
    this.throwNoTokenError = this.config.throwNoTokenError || false;
    this.skipWhenExpired = this.config.skipWhenExpired || false;
  }

  isAllowedDomain(request: HttpRequest<unknown>): boolean {
    const requestUrl: URL = new URL(request.url, this.document.location.origin);

    // If the host equals the current window origin,
    // the domain is allowed by default
    if (requestUrl.host === this.document.location.host) {
      return true;
    }

    // If not the current domain, check the allowed list
    const hostName = `${requestUrl.hostname}${
      requestUrl.port && !this.standardPorts.includes(requestUrl.port) ? ":" + requestUrl.port : ""
    }`;

    return (
      this.allowedDomains.findIndex(domain =>
        typeof domain === "string" ? domain === hostName : domain instanceof RegExp ? domain.test(hostName) : false
      ) > -1
    );
  }

  isDisallowedRoute(request: HttpRequest<unknown>): boolean {
    const requestedUrl: URL = new URL(request.url, this.document.location.origin);

    return (
      this.disallowedRoutes.findIndex((route: string | RegExp) => {
        if (typeof route === "string") {
          const parsedRoute: URL = new URL(route, this.document.location.origin);
          return parsedRoute.hostname === requestedUrl.hostname && parsedRoute.pathname === requestedUrl.pathname;
        }

        if (route instanceof RegExp) {
          return route.test(request.url);
        }

        return false;
      }) > -1
    );
  }

  handleInterception(token: string | null, request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const authScheme = this.jwtHelper.getAuthScheme(this.authScheme, request);

    if (!token && this.throwNoTokenError) {
      throw new Error("Could not get token from tokenGetter function.");
    }

    let tokenIsExpired = of(false);

    if (this.skipWhenExpired) {
      tokenIsExpired = token ? fromPromiseOrValue(this.jwtHelper.isTokenExpired(token)) : of(true);
    }

    if (token) {
      return tokenIsExpired.pipe(
        map(isExpired =>
          isExpired && this.skipWhenExpired
            ? request.clone()
            : request.clone({
                setHeaders: {
                  [this.headerName]: `${authScheme}${token}`,
                },
              })
        ),
        mergeMap(innerRequest => next.handle(innerRequest))
      );
    }

    return next.handle(request);
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isAllowedDomain(request) || this.isDisallowedRoute(request)) {
      return next.handle(request);
    }
    const token = this.tokenGetter(request);

    return fromPromiseOrValue(token).pipe(
      mergeMap((asyncToken: string | null) => {
        return this.handleInterception(asyncToken, request, next);
      })
    );
  }
}
