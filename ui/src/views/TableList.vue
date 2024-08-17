<template>
  <table>
    <thead>
      <tr>
        <th>name</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="table in tables" :key="table.name">
        <td>
          <RouterLink :to="table.name">{{ table.name }}</RouterLink>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import axios from "axios";
import { onMounted, ref } from "vue";
import { TablesGetManyDto } from "../../../lib/dto/tables-get-many.dto";
import { TablesGetOneDto } from "../../../lib/dto/tables-get-one.dto";

const tables = ref<TablesGetOneDto[]>([]);

onMounted(async () => {
  try {
    const response = await axios.get<TablesGetManyDto>(`/api/admin/tables`);
    tables.value = response.data.tables;
  } catch (error) {
    console.error(error);
  }
});
</script>
