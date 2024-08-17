export interface TablesGetOneDto {
  name: string;
  columns: Column[];
}

interface Column {
  name: string;
  type: string;
  nullable: boolean;
  primary: boolean;
  relation: boolean;

  referencedTable?: string;
}
