import { DynamicModule, Module } from "@nestjs/common";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { NestminModuleOptions } from "./interfaces/nestmin-module-options.interface";
import { NESTMIN_GUARD, NESTMIN_MODULE_OPTIONS } from "./nestmin.constants";
import { NestminController } from "./nestmin.controller";
import { NestminService } from "./nestmin.service";
import { ProxyGuard } from "./proxy.guard";

@Module({})
export class NestminModule {
  static register(options: NestminModuleOptions): DynamicModule {
    return {
      module: NestminModule,
      imports: [
        ServeStaticModule.forRoot({
          rootPath: join(__dirname, "ui"),
          serveRoot: `${options.prefix}/ui`,
        }),
      ],
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
    };
  }
}
