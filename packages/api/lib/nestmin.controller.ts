import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { PATH_METADATA } from "@nestjs/common/constants";
import { TablesGetDataDto } from "./dto/tables-get-data.dto";
import { TablesGetManyDto } from "./dto/tables-get-many.dto";
import { NestminModuleOptions } from "./interfaces/nestmin-module-options.interface";
import { NESTMIN_MODULE_OPTIONS } from "./nestmin.constants";
import { NestminService } from "./nestmin.service";

@Controller()
// @UseGuards(ProxyGuard)
@UsePipes(
  new ValidationPipe({
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }),
)
export class NestminController {
  constructor(
    @Inject(NESTMIN_MODULE_OPTIONS)
    private readonly options: NestminModuleOptions,
    private readonly nestminService: NestminService,
  ) {
    Reflect.defineMetadata(
      PATH_METADATA,
      this.options.prefix,
      NestminController,
    );
  }

  @Get("tables")
  getTables(): TablesGetManyDto {
    return this.nestminService.getTables();
  }

  @Get("tables/:name")
  getTable(@Param("name") entityName: string) {
    return this.nestminService.getTable(entityName);
  }

  @Put("tables/:name")
  addEntry(@Param("name") table: string, @Body() data: any) {
    return this.nestminService.addEntry(table, data);
  }

  @Patch("tables/:name")
  updateEntry(@Param("name") table: string, @Body() data: any) {
    return this.nestminService.updateEntry(table, data);
  }

  @Get("tables/:name/data")
  getTableData(
    @Param("name") entityName: string,
    @Query() query: TablesGetDataDto,
  ) {
    return this.nestminService.getTableData(entityName, query);
  }
}
