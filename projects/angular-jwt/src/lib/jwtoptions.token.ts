import { InjectionToken } from "@angular/core";
import { JwtConfig } from "angular-jwt/lib/provide-jwt-config";

export const JWT_OPTIONS = new InjectionToken<JwtConfig>("JWT_OPTIONS");
