import { Injectable, NotFoundException } from "@nestjs/common";
import { DataSource, EntityMetadata } from "typeorm";
import { TablesGetDataDto } from "./dto/tables-get-data.dto";
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

  getTableData(name: string, query: TablesGetDataDto) {
    const skip = (query.page - 1) * query.pageSize;

    const qb = this.dataSource.getRepository(name).createQueryBuilder();

    if (query.sortField) {
      qb.orderBy(query.sortField, query.sortOrder === 1 ? "ASC" : "DESC");
    }

    if (query.filters) {
      query.filters.forEach((filter) => {
        console.log(filter);
        switch (filter.matchMode.toLowerCase()) {
          case "equals":
            qb.andWhere(`${filter.column} = :value`, {
              value: filter.value,
            });
            break;

          case "contains":
            qb.andWhere(`${filter.column} LIKE :value`, {
              value: `%${filter.value}%`,
            });
            break;

          case "startswith":
            qb.andWhere(`${filter.column} LIKE :value`, {
              column: filter.column,
              value: `${filter.value}%`,
            });
            break;
        }
      });
    }

    return qb
      .loadAllRelationIds()
      .skip(skip)
      .take(query.pageSize)
      .getManyAndCount();
  }
}
