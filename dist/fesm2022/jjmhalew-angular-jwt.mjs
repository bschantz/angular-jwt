import { DOCUMENT } from '@angular/common';
import * as i0 from '@angular/core';
import { InjectionToken, Inject, Injectable, inject, makeEnvironmentProviders } from '@angular/core';
import { defer, of } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

const JWT_OPTIONS = new InjectionToken("JWT_OPTIONS");

class JwtHelperService {
    tokenGetter;
    constructor(config = null) {
        this.tokenGetter = (config && config.tokenGetter) || function () { };
    }
    urlBase64Decode(str) {
        let output = str.replace(/-/g, "+").replace(/_/g, "/");
        switch (output.length % 4) {
            case 0: {
                break;
            }
            case 2: {
                output += "==";
                break;
            }
            case 3: {
                output += "=";
                break;
            }
            default: {
                throw new Error("Illegal base64url string!");
            }
        }
        return this.b64DecodeUnicode(output);
    }
    // credits for decoder goes to https://github.com/atk
    b64decode(str) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        let output = "";
        str = String(str).replace(/=+$/, "");
        if (str.length % 4 === 1) {
            throw new Error(`'atob' failed: The string to be decoded is not correctly encoded.`);
        }
        for (
        // initialize result and counters
        let bc = 0, bs, buffer, idx = 0; 
        // get next character
        (buffer = str.charAt(idx++)); 
        // character found in table? initialize bit storage and add its ascii value;
        ~buffer &&
            ((bs = bc % 4 ? bs * 64 + buffer : buffer),
                // and if not first of each 4 characters,
                // convert the first 8 bits to one ascii character
                bc++ % 4)
            ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
            : 0) {
            // try to find character in table (0-63, not found => -1)
            buffer = chars.indexOf(buffer);
        }
        return output;
    }
    b64DecodeUnicode(str) {
        return decodeURIComponent(Array.prototype.map
            .call(this.b64decode(str), (c) => {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
            .join(""));
    }
    decodeToken(token = this.tokenGetter()) {
        if (token instanceof Promise) {
            return token.then(t => this._decodeToken(t));
        }
        return this._decodeToken(token);
    }
    _decodeToken(token) {
        if (!token || token === "") {
            return null;
        }
        const parts = token.split(".");
        if (parts.length !== 3) {
            throw new Error(`The inspected token doesn't appear to be a JWT. Check to make sure it has three parts and see https://jwt.io for more.`);
        }
        const decoded = this.urlBase64Decode(parts[1]);
        if (!decoded) {
            throw new Error("Cannot decode the token.");
        }
        return JSON.parse(decoded);
    }
    getTokenExpirationDate(token = this.tokenGetter()) {
        if (token instanceof Promise) {
            return token.then(t => this._getTokenExpirationDate(t));
        }
        return this._getTokenExpirationDate(token);
    }
    _getTokenExpirationDate(token) {
        let decoded;
        decoded = this.decodeToken(token);
        if (!decoded || !decoded.hasOwnProperty("exp")) {
            return null;
        }
        const date = new Date(0);
        date.setUTCSeconds(decoded.exp);
        return date;
    }
    isTokenExpired(token = this.tokenGetter(), offsetSeconds) {
        if (token instanceof Promise) {
            return token.then(t => this._isTokenExpired(t, offsetSeconds));
        }
        return this._isTokenExpired(token, offsetSeconds);
    }
    _isTokenExpired(token, offsetSeconds) {
        if (!token || token === "") {
            return true;
        }
        const date = this.getTokenExpirationDate(token);
        offsetSeconds = offsetSeconds || 0;
        if (date === null) {
            return false;
        }
        return !(date.valueOf() > new Date().valueOf() + offsetSeconds * 1000);
    }
    getAuthScheme(authScheme, request) {
        if (typeof authScheme === "function") {
            return authScheme(request);
        }
        return authScheme;
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.16", ngImport: i0, type: JwtHelperService, deps: [{ token: JWT_OPTIONS }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "21.2.16", ngImport: i0, type: JwtHelperService });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.16", ngImport: i0, type: JwtHelperService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [JWT_OPTIONS]
                }] }] });

const fromPromiseOrValue = (input) => {
    if (input instanceof Promise) {
        return defer(() => input);
    }
    return of(input);
};
class JwtInterceptor {
    tokenGetter;
    headerName;
    authScheme;
    allowedDomains;
    disallowedRoutes;
    throwNoTokenError;
    skipWhenExpired;
    standardPorts = ["80", "443"];
    jwtHelper = inject(JwtHelperService);
    config = inject(JWT_OPTIONS);
    document = inject(DOCUMENT);
    constructor() {
        this.tokenGetter = this.config.tokenGetter;
        this.headerName = this.config.headerName || "Authorization";
        this.authScheme = this.config.authScheme || this.config.authScheme === "" ? this.config.authScheme : "Bearer ";
        this.allowedDomains = this.config.allowedDomains || [];
        this.disallowedRoutes = this.config.disallowedRoutes || [];
        this.throwNoTokenError = this.config.throwNoTokenError || false;
        this.skipWhenExpired = this.config.skipWhenExpired || false;
    }
    isAllowedDomain(request) {
        const requestUrl = new URL(request.url, this.document.location.origin);
        // If the host equals the current window origin,
        // the domain is allowed by default
        if (requestUrl.host === this.document.location.host) {
            return true;
        }
        // If not the current domain, check the allowed list
        const hostName = `${requestUrl.hostname}${requestUrl.port && !this.standardPorts.includes(requestUrl.port) ? ":" + requestUrl.port : ""}`;
        return (this.allowedDomains.findIndex(domain => typeof domain === "string" ? domain === hostName : domain instanceof RegExp ? domain.test(hostName) : false) > -1);
    }
    isDisallowedRoute(request) {
        const requestedUrl = new URL(request.url, this.document.location.origin);
        return (this.disallowedRoutes.findIndex((route) => {
            if (typeof route === "string") {
                const parsedRoute = new URL(route, this.document.location.origin);
                return parsedRoute.hostname === requestedUrl.hostname && parsedRoute.pathname === requestedUrl.pathname;
            }
            if (route instanceof RegExp) {
                return route.test(request.url);
            }
            return false;
        }) > -1);
    }
    handleInterception(token, request, next) {
        const authScheme = this.jwtHelper.getAuthScheme(this.authScheme, request);
        if (!token && this.throwNoTokenError) {
            throw new Error("Could not get token from tokenGetter function.");
        }
        let tokenIsExpired = of(false);
        if (this.skipWhenExpired) {
            tokenIsExpired = token ? fromPromiseOrValue(this.jwtHelper.isTokenExpired(token)) : of(true);
        }
        if (token) {
            return tokenIsExpired.pipe(map(isExpired => isExpired && this.skipWhenExpired
                ? request.clone()
                : request.clone({
                    setHeaders: {
                        [this.headerName]: `${authScheme}${token}`,
                    },
                })), mergeMap(innerRequest => next.handle(innerRequest)));
        }
        return next.handle(request);
    }
    intercept(request, next) {
        if (!this.isAllowedDomain(request) || this.isDisallowedRoute(request)) {
            return next.handle(request);
        }
        const token = this.tokenGetter(request);
        return fromPromiseOrValue(token).pipe(mergeMap((asyncToken) => {
            return this.handleInterception(asyncToken, request, next);
        }));
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "21.2.16", ngImport: i0, type: JwtInterceptor, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "21.2.16", ngImport: i0, type: JwtInterceptor });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "21.2.16", ngImport: i0, type: JwtInterceptor, decorators: [{
            type: Injectable
        }], ctorParameters: () => [] });

/**
 * Provides Jwt configuration at the root level:
 * ```ts
 * bootstrapApplication(AppComponent, {
 *   providers: [provideJwtConfig(...)]
 * });
 * ```
 */
const provideJwtConfig = (options) => makeEnvironmentProviders([
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    options.jwtOptionsProvider || { provide: JWT_OPTIONS, useValue: options.config },
    JwtHelperService,
]);

/*
 * Public API Surface of angular-jwt
 */

/**
 * Generated bundle index. Do not edit.
 */

export { JWT_OPTIONS, JwtHelperService, JwtInterceptor, provideJwtConfig };
//# sourceMappingURL=jjmhalew-angular-jwt.mjs.map
