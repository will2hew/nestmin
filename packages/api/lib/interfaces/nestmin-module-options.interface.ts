import { CanActivate, Type } from "@nestjs/common";

export interface NestminModuleOptions {
  prefix: string;
  guard: Type<CanActivate>;
}
