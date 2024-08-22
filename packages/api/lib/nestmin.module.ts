import {
  DynamicModule,
  Inject,
  MiddlewareConsumer,
  Module,
  NestModule,
} from "@nestjs/common";
import * as express from "express";
import { join, resolve } from "path";
import { NestminModuleOptions } from "./interfaces/nestmin-module-options.interface";
import { NESTMIN_GUARD, NESTMIN_MODULE_OPTIONS } from "./nestmin.constants";
import { NestminController } from "./nestmin.controller";
import { NestminService } from "./nestmin.service";
import { ProxyGuard } from "./proxy.guard";

@Module({})
export class NestminModule implements NestModule {
  constructor(
    @Inject(NESTMIN_MODULE_OPTIONS)
    private readonly options: NestminModuleOptions,
  ) {}

  configure(consumer: MiddlewareConsumer) {
    const path = resolve(join(__dirname, "..", "ui"));
    consumer.apply(express.static(path)).forRoutes(`/${this.options.prefix}`);
  }

  static register(options: NestminModuleOptions): DynamicModule {
    return {
      module: NestminModule,
      imports: [],
      providers: [
        {
          provide: NESTMIN_MODULE_OPTIONS,
          useValue: options,
        },
        {
          provide: NESTMIN_GUARD,
          useClass: options.guard,
        },
        ProxyGuard,
        NestminService,
      ],
      controllers: [NestminController],
      exports: [ProxyGuard],
    };
  }
}
