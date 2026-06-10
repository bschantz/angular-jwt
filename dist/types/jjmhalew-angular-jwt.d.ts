import * as _jjmhalew_angular_jwt from '@jjmhalew/angular-jwt';
import { HttpRequest, HttpInterceptor, HttpHandler, HttpEvent } from '@angular/common/http';
import * as i0 from '@angular/core';
import { InjectionToken, Provider, EnvironmentProviders } from '@angular/core';
import { Observable } from 'rxjs';
import { JwtConfig as JwtConfig$1 } from 'angular-jwt/lib/provide-jwt-config';

declare class JwtHelperService {
    tokenGetter: () => string | Promise<string>;
    constructor(config?: any);
    urlBase64Decode(str: string): string;
    private b64decode;
    private b64DecodeUnicode;
    decodeToken<T = any>(token: string): T | null;
    decodeToken<T = any>(token: Promise<string>): Promise<T | null>;
    decodeToken<T = any>(): null | T | Promise<T | null>;
    private _decodeToken;
    getTokenExpirationDate(token: string): Date | null;
    getTokenExpirationDate(token: Promise<string>): Promise<Date | null>;
    getTokenExpirationDate(): null | Date | Promise<Date | null>;
    private _getTokenExpirationDate;
    isTokenExpired(token?: undefined, offsetSeconds?: number): boolean | Promise<boolean>;
    isTokenExpired(token: string | null, offsetSeconds?: number): boolean;
    isTokenExpired(token: Promise<string>, offsetSeconds?: number): Promise<boolean>;
    private _isTokenExpired;
    getAuthScheme(authScheme: Function | string | undefined, request: HttpRequest<any>): string | undefined;
    static ɵfac: i0.ɵɵFactoryDeclaration<JwtHelperService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<JwtHelperService>;
}

declare class JwtInterceptor implements HttpInterceptor {
    tokenGetter: (request?: HttpRequest<unknown>) => string | null | Promise<string | null>;
    headerName: string;
    authScheme: string | ((request?: HttpRequest<unknown>) => string);
    allowedDomains: Array<string | RegExp>;
    disallowedRoutes: Array<string | RegExp>;
    throwNoTokenError: boolean;
    skipWhenExpired: boolean;
    standardPorts: string[];
    jwtHelper: JwtHelperService;
    config: _jjmhalew_angular_jwt.JwtConfig;
    private document;
    constructor();
    isAllowedDomain(request: HttpRequest<unknown>): boolean;
    isDisallowedRoute(request: HttpRequest<unknown>): boolean;
    handleInterception(token: string | null, request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>>;
    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<JwtInterceptor, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<JwtInterceptor>;
}

declare const JWT_OPTIONS: InjectionToken<JwtConfig$1>;

type JwtTokenGetterType = (request?: HttpRequest<unknown>) => string | null | Promise<string | null>;
interface JwtConfig {
    tokenGetter: JwtTokenGetterType;
    headerName?: string;
    authScheme?: string | ((request?: HttpRequest<unknown>) => string);
    allowedDomains?: Array<string | RegExp>;
    disallowedRoutes?: Array<string | RegExp>;
    throwNoTokenError?: boolean;
    skipWhenExpired?: boolean;
}
interface JwtProviderOptions {
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
declare const provideJwtConfig: (options: JwtProviderOptions) => EnvironmentProviders;

export { JWT_OPTIONS, JwtHelperService, JwtInterceptor, provideJwtConfig };
export type { JwtConfig, JwtProviderOptions, JwtTokenGetterType };
