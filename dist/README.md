![Helper library for handling JWTs in Angular applications](https://cdn.auth0.com/website/sdks/banners/angular-jwt-banner.png)

![Release](https://img.shields.io/github/v/release/jjmhalew/angular-jwt)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/jjmhalew/angular2-jwt)
![Downloads](https://img.shields.io/npm/dw/@jjmhalew/angular-jwt)
[![License](https://img.shields.io/:license-MIT-blue.svg?style=flat)](https://opensource.org/licenses/MIT)

:books: [Documentation](#documentation) - :rocket: [Getting Started](#getting-started) - :computer: [API Reference](#api-reference) - :speech_balloon: [Feedback](#feedback)

## Documentation

- [Examples](https://github.com/jjmhalew/angular-jwt/blob/main/EXAMPLES.md) - code samples for common angular-jwt authentication scenario's.
- [Docs site](https://www.auth0.com/docs) - explore our docs site and learn more about Auth0.

This library provides an `HttpInterceptor` which automatically attaches a [JSON Web Token](https://jwt.io) to `HttpClient` requests.

This library does not have any functionality for (or opinion about) implementing user authentication and retrieving JWTs to begin with. Those details will vary depending on your setup, but in most cases, you will use a regular HTTP request to authenticate your users and then save their JWTs in local storage or in a cookie if successful.

## Getting started
### Requirements
This project only supports the [actively supported versions of Angular as stated in the Angular documentation](https://angular.dev/reference/releases#actively-supported-versions). Whilst other versions might be compatible they are not actively supported

### Installation

```bash
# installation with npm
npm install @jjmhalew/angular-jwt

# installation with yarn
yarn add @jjmhalew/angular-jwt
```

## Configure the SDK

Import `provideJwtConfig` and add it to your imports list. Provide a `tokenGetter` function. You must also add any domains to the `allowedDomains`, that you want to make requests to by specifying an `allowedDomains` array.

Be sure to import the `provideHttpClient` as well.

```ts
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

export function tokenGetter() {
  return localStorage.getItem("access_token");
}

export const appConfig: ApplicationConfig = {
  providers: [
    // ...
    provideHttpClient(withInterceptorsFromDi()),
    provideJwtConfig({
      tokenGetter: tokenGetter,
      allowedDomains: ["example.com"],
      disallowedRoutes: ["http://example.com/examplebadroute/"],
    }),
  ],
};
```

Any requests sent using Angular's `HttpClient` will automatically have a token attached as an `Authorization` header.

```ts
import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";

export class AppComponent {
  public http = inject(HttpClient);

  ping() {
    this.http.get("http://example.com/api/things").subscribe(
      (data) => console.log(data),
      (err) => console.log(err)
    );
  }
}
```
- In order to use the SDK's interceptor, `provideHttpClient` needs to be called with `withInterceptorsFromDi`.


## API reference
Read [our API reference](https://github.com/jjmhalew/angular-jwt/blob/main/API.md) to get a better understanding on how to use this SDK.

## Feedback

### Contributing

We appreciate feedback and contribution to this repo! Before you get started, please see the following:

- [Auth0's general contribution guidelines](https://github.com/auth0/open-source-template/blob/master/GENERAL-CONTRIBUTING.md)
- [Auth0's code of conduct guidelines](https://github.com/auth0/open-source-template/blob/master/CODE-OF-CONDUCT.md)
- [This repo's contribution guide](https://github.com/jjmhalew/angular-jwt/blob/main/CONTRIBUTING.md)
### Raise an issue

To provide feedback or report a bug, please [raise an issue on our issue tracker](https://github.com/jjmhalew/angular-jwt/issues).

### Vulnerability Reporting

Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/responsible-disclosure-policy) details the procedure for disclosing security issues.

---

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="https://cdn.auth0.com/website/sdks/logos/auth0_light_mode.png"   width="150">
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.auth0.com/website/sdks/logos/auth0_dark_mode.png" width="150">
    <img alt="Auth0 Logo" src="https://cdn.auth0.com/website/sdks/logos/auth0_light_mode.png" width="150">
  </picture>
</p>
<p align="center">Auth0 is an easy to implement, adaptable authentication and authorization platform. To learn more checkout <a href="https://auth0.com/why-auth0">Why Auth0?</a></p>
<p align="center">
This project is licensed under the MIT license. See the <a href="https://github.com/jjmhalew/angular-jwt/blob/main/LICENSE"> LICENSE</a> file for more info.</p>
