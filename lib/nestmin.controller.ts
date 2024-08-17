import { Controller, Get, Inject, Param, Query } from "@nestjs/common";
import { TablesGetManyDto } from "./dto/tables-get-many.dto";
import { NestminModuleOptions } from "./interfaces/nestmin-module-options.interface";
import { NESTMIN_MODULE_OPTIONS } from "./nestmin.constants";
import { NestminService } from "./nestmin.service";

@Controller("admin")
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

  @Get("tables/:name/data")
  getTableData(
    @Param("name") entityName: string,
    @Query("page") pageString: string,
    @Query("pageSize") pageSizeString: string,
  ) {
    const page = parseInt(pageString);
    const pageSize = parseInt(pageSizeString);

    return this.nestminService.getTableData(entityName, page, pageSize);
  }
}
