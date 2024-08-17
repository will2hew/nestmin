<template>
  <Card class="m-5">
    <template #content>
      <DataTable
        v-if="tableDetails"
        v-model:selection="selectedRows"
        size="small"
        :value="tableData"
        show-gridlines
        paginator
        :rows="pageSize"
        :rowsPerPageOptions="[10, 25, 50]"
        :total-records="tableTotalRows"
        lazy
        @page="handlePageChange"
      >
        <Column selection-mode="multiple" header-style="width: 3rem" />

        <Column
          v-for="column in tableDetails.columns"
          :key="column.name"
          :field="column.name"
          :header="column.name"
        >
          <template v-if="column.referencedTable" #body="slotProps">
            <RouterLink :to="column.referencedTable">
              <Badge class="cursor-pointer">
                {{ slotProps.data[column.name] }}
              </Badge>
            </RouterLink>
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>
</template>
<script setup lang="ts">
import axios from "axios";
import Badge from "primevue/badge";
import Column from "primevue/column";
import DataTable from "primevue/datatable";

import Card from "primevue/card";

import { PageState } from "primevue/paginator";
import { ref, watch } from "vue";
import { TablesGetOneDto } from "../../../lib/dto/tables-get-one.dto";

const selectedRows = ref<any[]>([]);

const tableDetails = ref<TablesGetOneDto | null>(null);
const tableData = ref<any[]>([]);
const tableTotalRows = ref(0);

const pageStart = ref(0);
const pageSize = ref(10);

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

    const tableDataResponse = await axios.get<any[]>(
      `/api/admin/tables/${props.name}/data`,
      {
        params: {
          page: Math.floor(pageStart.value / pageSize.value) + 1,
          pageSize: pageSize.value,
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
  () => props.name,
  async () => {
    await loadData();
  },
  { immediate: true },
);
</script>
