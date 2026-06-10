import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { provideJwtConfig } from "angular-jwt";
import { ExampleHttpService } from "./example-http.service";
import { HttpRequest } from "@angular/common/http";

export function tokenGetter(): string {
  return "TEST_TOKEN";
}

export function tokenGetterWithRequest(request?: HttpRequest<unknown>): string {
  if (request?.url.includes("1")) return "TEST_TOKEN_1";
  if (request?.url.includes("2")) return "TEST_TOKEN_2";
  return "TEST_TOKEN";
}

export function tokenGetterWithPromise(): Promise<string> {
  return Promise.resolve("TEST_TOKEN");
}

describe("Example HttpService: with promise based tokken getter", (): void => {
  let service: ExampleHttpService;
  let httpMock: HttpTestingController;

  const validRoutes = [
    `/assets/example-resource.json`,
    `http://allowed.com/api/`,
    `http://allowed.com/api/test`,
    `http://allowed.com:443/api/test`,
    `http://allowed-regex.com/api/`,
    `https://allowed-regex.com/api/`,
    `http://localhost:3000`,
    `http://localhost:3000/api`,
  ];

  const invalidRoutes = [
    `http://allowed.com/api/disallowed`,
    `http://allowed.com/api/disallowed-protocol`,
    `http://allowed.com:80/api/disallowed-protocol`,
    `http://allowed.com/api/disallowed-regex`,
    `http://allowed-regex.com/api/disallowed-regex`,
    `http://foo.com/bar`,
    "http://localhost/api",
    "http://localhost:4000/api",
  ];

  beforeEach((): void => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        provideJwtConfig({
          config: {
            tokenGetter: tokenGetterWithPromise,
            allowedDomains: ["allowed.com", /allowed-regex*/, "localhost:3000"],
            disallowedRoutes: ["http://allowed.com/api/disallowed-protocol", "//allowed.com/api/disallowed", /disallowed-regex*/],
          },
        }),
        ExampleHttpService,
      ],
    });

    service = TestBed.inject(ExampleHttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach((): void => {
    httpMock.verify();
  });

  it("should add Authorisation header (service should be created)", (): void => {
    expect(service).toBeTruthy();
  });

  validRoutes.forEach((route): void =>
    it(`should set the correct auth token for an allowed domain: ${route}`, async (): Promise<void> => {
      service.testRequest(route).subscribe((response): void => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(route);

      expect(req.request.headers.has("Authorization")).toBe(true);
      expect(req.request.headers.get("Authorization")).toBe(`Bearer TEST_TOKEN`);

      req.flush({ ok: true });
    })
  );

  invalidRoutes.forEach((route): void =>
    it(`should not set the auth token for a disallowed route: ${route}`, async (): Promise<void> => {
      service.testRequest(route).subscribe((response): void => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(route);

      expect(req.request.headers.has("Authorization")).toBe(false);

      req.flush({ ok: true });
    })
  );
});

describe("Example HttpService: with simple tokken getter", (): void => {
  let service: ExampleHttpService;
  let httpMock: HttpTestingController;

  const validRoutes = [
    `/assets/example-resource.json`,
    `http://allowed.com/api/`,
    `http://allowed.com/api/test`,
    `http://allowed.com:443/api/test`,
    `http://allowed-regex.com/api/`,
    `https://allowed-regex.com/api/`,
    `http://localhost:3000`,
    `http://localhost:3000/api`,
  ];

  const invalidRoutes = [
    `http://allowed.com/api/disallowed`,
    `http://allowed.com/api/disallowed-protocol`,
    `http://allowed.com:80/api/disallowed-protocol`,
    `http://allowed.com/api/disallowed-regex`,
    `http://allowed-regex.com/api/disallowed-regex`,
    `http://foo.com/bar`,
    "http://localhost/api",
    "http://localhost:4000/api",
  ];

  beforeEach((): void => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        provideJwtConfig({
          config: {
            tokenGetter,
            allowedDomains: ["allowed.com", /allowed-regex*/, "localhost:3000"],
            disallowedRoutes: ["http://allowed.com/api/disallowed-protocol", "//allowed.com/api/disallowed", /disallowed-regex*/],
          },
        }),
        ExampleHttpService,
      ],
    });

    service = TestBed.inject(ExampleHttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach((): void => {
    httpMock.verify();
  });

  it("should add Authorisation header (service should be created)", (): void => {
    expect(service).toBeTruthy();
  });

  validRoutes.forEach((route): void =>
    it(`should set the correct auth token for an allowed domain: ${route}`, (): void => {
      service.testRequest(route).subscribe((response): void => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(route);

      expect(req.request.headers.has("Authorization")).toBe(true);
      expect(req.request.headers.get("Authorization")).toBe(`Bearer ${tokenGetter()}`);

      req.flush({ ok: true });
    })
  );

  invalidRoutes.forEach((route): void =>
    it(`should not set the auth token for a disallowed route: ${route}`, (): void => {
      service.testRequest(route).subscribe((response): void => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(route);

      expect(req.request.headers.has("Authorization")).toBe(false);

      req.flush({ ok: true });
    })
  );
});

describe("Example HttpService: with request based tokken getter", (): void => {
  let service: ExampleHttpService;
  let httpMock: HttpTestingController;

  const routes = [`http://example-1.com/api/`, `http://example-2.com/api/`, `http://example-3.com/api/`];

  beforeEach((): void => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        provideJwtConfig({
          config: {
            tokenGetter: tokenGetterWithRequest,
            allowedDomains: ["example-1.com", "example-2.com", "example-3.com"],
          },
        }),
        ExampleHttpService,
      ],
    });

    service = TestBed.inject(ExampleHttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach((): void => {
    httpMock.verify();
  });

  it("should add Authorisation header (service should be created)", (): void => {
    expect(service).toBeTruthy();
  });

  routes.forEach((route): void =>
    it(`should set the correct auth token for a domain: ${route}`, (): void => {
      service.testRequest(route).subscribe((response): void => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne(route);

      expect(req.request.headers.has("Authorization")).toBe(true);
      expect(req.request.headers.get("Authorization")).toBe(`Bearer ${tokenGetterWithRequest(new HttpRequest("GET", route))}`);

      req.flush({ ok: true });
    })
  );
});

const authSchemes: Array<[undefined | string | (() => string), string]> = [
  [undefined, "Bearer "],
  ["Basic ", "Basic "],
  [(): string => "Basic ", "Basic "],
];

authSchemes.forEach(([schemeInput, expectedPrefix]): void => {
  describe(`Example HttpService: with ${
    typeof schemeInput === "function" ? "an authscheme getter function" : "a simple authscheme getter"
  }`, (): void => {
    let service: ExampleHttpService;
    let httpMock: HttpTestingController;

    beforeEach((): void => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClientTesting(),
          provideJwtConfig({
            config: {
              tokenGetter,
              authScheme: schemeInput as string | ((request?: HttpRequest<unknown> | undefined) => string) | undefined,
              allowedDomains: ["allowed.com"],
            },
          }),
          ExampleHttpService,
        ],
      });

      service = TestBed.inject(ExampleHttpService);
      httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach((): void => {
      httpMock.verify();
    });

    it(`should set the correct auth scheme on a request (${expectedPrefix})`, (): void => {
      service.testRequest("http://allowed.com").subscribe((response): void => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne("http://allowed.com");

      expect(req.request.headers.has("Authorization")).toBe(true);
      expect(req.request.headers.get("Authorization")).toBe(`${expectedPrefix}${tokenGetter()}`);

      req.flush({ ok: true });
    });
  });
});
