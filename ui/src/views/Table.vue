<template>
  <Card>
    <template #content>
      <DataTable
        v-if="tableDetails"
        v-model:first="pageStart"
        v-model:rows="pageSize"
        v-model:sort-field="sortField"
        v-model:sort-order="sortOrder"
        v-model:filters="filters"
        v-model:editing-rows="editingRows"
        edit-mode="row"
        filter-display="row"
        size="small"
        :value="tableData"
        show-gridlines
        paginator
        :rowsPerPageOptions="[10, 25, 50]"
        :total-records="tableTotalRows"
        lazy
        removable-sort
        resizable-columns
        @row-edit-save="handleRowSave"
      >
        <template #header>
          <div class="flex justify-between">
            <span class="text-xl font-bold" v-if="tableDetails">
              {{ tableDetails.name }}
            </span>
            <div>
              <Button
                icon="pi pi-plus"
                size="small"
                severity="secondary"
                @click="showAddRowDialog = true"
              />
            </div>
          </div>
        </template>

        <Column
          v-if="filters"
          v-for="column in tableDetails.columns"
          :key="column.name"
          :field="column.name"
          :sortable="!column.relation"
          align-frozen="left"
          :frozen="column.primary"
        >
          <template #filter="{ filterModel }">
            <InputText
              v-model="filterModel.value"
              type="text"
              :placeholder="`Filter by ${column.name}`"
            />
          </template>

          <template #header>
            <div v-tooltip.top="column.comment">
              {{ column.name }}
              <Badge v-if="column.primary" size="small">PK</Badge>
              <Badge v-if="column.relation" size="small" severity="info">
                FK
              </Badge>
            </div>
          </template>

          <template #body="slotProps">
            <template v-if="column.referencedTable">
              <RouterLink :to="column.referencedTable">
                <Chip class="text-sm">
                  {{ slotProps.data[column.name] }}
                  <i class="pi pi-external-link" />
                </Chip>
              </RouterLink>
            </template>
            <template v-else-if="column.nullable">
              <Badge
                v-if="slotProps.data[column.name] === null"
                severity="secondary"
              >
                NULL
              </Badge>
              <template v-else>
                {{ slotProps.data[column.name] }}
              </template>
            </template>
            <template v-else-if="column.type === 'datetime'">
              <Badge severity="secondary">
                {{ new Date(slotProps.data[column.name]).toLocaleString() }}
              </Badge>
            </template>
            <template v-else-if="!column.selected">
              <Badge
                v-tooltip.top="'This column has been marked as select: false'"
                severity="secondary"
                >Hidden</Badge
              >
            </template>
            <template v-else>
              {{ slotProps.data[column.name] }}
            </template>
          </template>

          <template #editor="{ data, field }">
            <InputText v-if="column.type === 'text'" v-model="data[field]" />
          </template>
        </Column>

        <Column
          :rowEditor="true"
          style="width: 10%; min-width: 8rem"
          bodyStyle="text-align:center"
        />
      </DataTable>
    </template>
  </Card>

  <Dialog v-model:visible="showAddRowDialog" modal :draggable="false">
    <AddRow
      @add-row="handleAddRow"
      v-if="tableDetails"
      :table-details="tableDetails"
    />
  </Dialog>
</template>
<script setup lang="ts">
import axios from "axios";
import Badge from "primevue/badge";
import Button from "primevue/button";
import Card from "primevue/card";
import Chip from "primevue/chip";
import Column from "primevue/column";
import DataTable, {
  DataTableFilterMeta,
  DataTableRowEditSaveEvent,
} from "primevue/datatable";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import { onMounted, ref, toRaw, watch } from "vue";
import { RouterLink } from "vue-router";
import { FilterDto } from "../../../lib/dto/tables-get-data.dto";
import { TablesGetOneDto } from "../../../lib/dto/tables-get-one.dto";
import AddRow from "../components/AddRow.vue";

const showAddRowDialog = ref(false);

const editingRows = ref<any[]>([]);

const tableDetails = ref<TablesGetOneDto | null>(null);
const tableData = ref<any[]>([]);
const tableTotalRows = ref(0);

const filters = ref<DataTableFilterMeta | null>(null);

const pageStart = ref(0);
const pageSize = ref(10);

const sortField = ref<string | null>(null);
const sortOrder = ref(1);

const props = defineProps({
  name: String,
});

async function handleRowSave(event: DataTableRowEditSaveEvent) {
  try {
    await axios.patch(`/api/admin/tables/${props.name}`, event.newData);
    await loadData();
  } catch (error) {
    console.error(error);
  }
}

async function handleAddRow(formData: any) {
  try {
    await axios.put(`/api/admin/tables/${props.name}`, formData);
    await loadData();
    showAddRowDialog.value = false;
  } catch (error) {
    console.error(error);
  }
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

watch(
  [() => props.name, sortField, sortOrder, filters, pageStart, pageSize],
  loadData,
  { immediate: true },
);

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
