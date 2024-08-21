import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, ValidateNested } from "class-validator";

export class FilterDto {
  @IsString()
  column: string;

  @IsString()
  value: string;

  @IsString()
  matchMode: string;
}

export class TablesGetDataDto {
  @IsInt()
  @Type(() => Number)
  page: number;

  @IsInt()
  @Type(() => Number)
  pageSize: number;

  @IsString()
  @IsOptional()
  sortField?: string;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  sortOrder?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FilterDto)
  filters?: FilterDto[];
}
