import { Injectable, NotFoundException } from "@nestjs/common";
import { DataSource, EntityMetadata } from "typeorm";
import { TablesGetManyDto } from "./dto/tables-get-many.dto";
import { TablesGetOneDto } from "./dto/tables-get-one.dto";
@Injectable()
export class NestminService {
  constructor(private readonly dataSource: DataSource) {}

  getTables(): TablesGetManyDto {
    const entities = this.dataSource.entityMetadatas;

    return {
      tables: entities.map((entity) => {
        return this.getTable(entity.name);
      }),
    };
  }

  getTable(name: string): TablesGetOneDto {
    const entity: EntityMetadata | undefined =
      this.dataSource.entityMetadatas.find((entity) => entity.name === name);

    if (entity === undefined) {
      throw new NotFoundException("Entity not found");
    }

    return {
      name: entity.name,
      columns: entity.columns.map((column) => {
        return {
          name: column.propertyName,
          type: column.type.toString(),
          nullable: column.isNullable,
          primary: column.isPrimary,
          relation: column.relationMetadata ? true : undefined,

          referencedTable: column.relationMetadata
            ? column.relationMetadata.inverseEntityMetadata.name
            : undefined,
        };
      }),
    };
  }

  getTableData(name: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    return this.dataSource
      .getRepository(name)
      .createQueryBuilder()
      .loadAllRelationIds()
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();
  }
}
