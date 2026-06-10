import { HTTP_INTERCEPTORS, HttpRequest } from "@angular/common/http";
import { EnvironmentProviders, makeEnvironmentProviders, Provider } from "@angular/core";
import { JwtInterceptor } from "./jwt.interceptor";
import { JwtHelperService } from "./jwthelper.service";
import { JWT_OPTIONS } from "./jwtoptions.token";

export type JwtTokenGetterType = (request?: HttpRequest<unknown>) => string | null | Promise<string | null>;

export interface JwtConfig {
  tokenGetter: JwtTokenGetterType;
  headerName?: string;
  authScheme?: string | ((request?: HttpRequest<unknown>) => string);
  allowedDomains?: Array<string | RegExp>;
  disallowedRoutes?: Array<string | RegExp>;
  throwNoTokenError?: boolean;
  skipWhenExpired?: boolean;
}

export interface JwtProviderOptions {
  jwtOptionsProvider?: Provider;
  config?: JwtConfig;
}

/**
 * Provides Jwt configuration at the root level:
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [provideJwtConfig(...)]
 * });
 * ```
 */
export const provideJwtConfig = (options: JwtProviderOptions): EnvironmentProviders =>
  makeEnvironmentProviders([
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    options.jwtOptionsProvider || { provide: JWT_OPTIONS, useValue: options.config },
    JwtHelperService,
  ]);
