<template>
  <Card class="m-5">
    <template #content>
      <DataTable
        v-if="tableDetails"
        v-model:sort-field="sortField"
        v-model:sort-order="sortOrder"
        v-model:filters="filters"
        v-model:editing-rows="editingRows"
        filter-display="row"
        size="small"
        :value="tableData"
        show-gridlines
        paginator
        :rows="pageSize"
        :rowsPerPageOptions="[10, 25, 50]"
        :total-records="tableTotalRows"
        edit-mode="row"
        lazy
        removable-sort
        resizable-columns
        @page="handlePageChange"
        @row-edit-save="saveRow"
      >
        <Column
          v-if="filters"
          v-for="column in tableDetails.columns"
          :key="column.name"
          :field="column.name"
          :sortable="!column.relation"
        >
          <template #filter="{ filterModel }">
            <InputText
              v-model="filterModel.value"
              type="text"
              :placeholder="`Filter by ${column.name}`"
            />
          </template>

          <template #header>
            {{ column.name }}
            <Badge v-if="column.primary" size="small">PK</Badge>
            <Badge v-if="column.relation" size="small" severity="info">
              FK
            </Badge>
          </template>

          <template v-if="column.referencedTable" #body="slotProps">
            <RouterLink :to="column.referencedTable">
              <Badge class="cursor-pointer">
                {{ slotProps.data[column.name] }}
              </Badge>
            </RouterLink>
          </template>

          <template #editor="{ data, field }">
            <InputText v-model="data[field]" />
          </template>
        </Column>
        <Column :rowEditor="true" bodyStyle="text-align:center"></Column>
      </DataTable>
    </template>
  </Card>
</template>
<script setup lang="ts">
import axios from "axios";
import Badge from "primevue/badge";
import Card from "primevue/card";
import Column from "primevue/column";
import DataTable, { DataTableFilterMeta } from "primevue/datatable";
import InputText from "primevue/inputtext";
import { PageState } from "primevue/paginator";
import { onMounted, ref, toRaw, watch } from "vue";
import { FilterDto } from "../../../lib/dto/tables-get-data.dto";
import { TablesGetOneDto } from "../../../lib/dto/tables-get-one.dto";

const tableDetails = ref<TablesGetOneDto | null>(null);
const tableData = ref<any[]>([]);
const tableTotalRows = ref(0);

const editingRows = ref<any[]>([]);

const filters = ref<DataTableFilterMeta | null>(null);

const pageStart = ref(0);
const pageSize = ref(10);

const sortField = ref<string | null>(null);
const sortOrder = ref(1);

const props = defineProps({
  name: String,
});

async function handlePageChange(event: PageState) {
  pageStart.value = event.first;
  pageSize.value = event.rows;
  await loadData();
}

async function loadData(): Promise<void> {
  try {
    const tableDetailsResponse = await axios.get<TablesGetOneDto>(
      `/api/admin/tables/${props.name}`,
    );

    tableDetails.value = tableDetailsResponse.data;

    let formattedFilters: FilterDto[] = [];
    if (filters.value) {
      const filtersKeys = Object.keys(filters.value);

      for (const key of filtersKeys) {
        const filter = toRaw(
          filters.value[key],
        ) as unknown as DataTableFilterMeta;

        if (filter.value !== null) {
          formattedFilters.push({
            column: key,
            value: String(filter.value),
            matchMode: String(filter.matchMode),
          });
        }
      }
    }

    const tableDataResponse = await axios.get<any[]>(
      `/api/admin/tables/${props.name}/data`,
      {
        params: {
          page: Math.floor(pageStart.value / pageSize.value) + 1,
          pageSize: pageSize.value,

          ...(sortField.value !== null && {
            sortField: sortField.value,
            sortOrder: sortOrder.value,
          }),

          ...(formattedFilters.length > 0 && {
            filters: formattedFilters,
          }),
        },
      },
    );

    tableData.value = tableDataResponse.data[0];
    tableTotalRows.value = tableDataResponse.data[1];
  } catch (error) {
    console.error(error);
  }
}

watch(filters, async () => await loadData());

watch(
  () => props.name,
  async () => {
    await loadData();
  },
);

watch([sortField, sortOrder], async () => {
  await loadData();
});

onMounted(async () => {
  await loadData();

  if (tableDetails.value) {
    filters.value = Object.fromEntries(
      tableDetails.value.columns.map((column) => [
        column.name,
        { value: null, matchMode: "equals" },
      ]),
    );
  }
});
</script>
