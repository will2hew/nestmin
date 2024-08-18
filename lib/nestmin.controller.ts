import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { TablesGetDataDto } from "./dto/tables-get-data.dto";
import { TablesGetManyDto } from "./dto/tables-get-many.dto";
import { NestminModuleOptions } from "./interfaces/nestmin-module-options.interface";
import { NESTMIN_MODULE_OPTIONS } from "./nestmin.constants";
import { NestminService } from "./nestmin.service";
import { ProxyGuard } from "./proxy.guard";

@Controller("admin")
@UseGuards(ProxyGuard)
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
  ) {}

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
