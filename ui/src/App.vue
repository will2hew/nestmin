<script setup lang="ts">
import axios from "axios";
import Menu from "primevue/menu";
import { MenuItem } from "primevue/menuitem";
import { onMounted, ref } from "vue";
import { RouterView, useRouter } from "vue-router";
import { TablesGetManyDto } from "../../lib/dto/tables-get-many.dto";

const router = useRouter();
const items = ref<MenuItem[]>([
  {
    label: "Tables",
    items: [],
  },
]);

onMounted(async () => {
  try {
    const response = await axios.get<TablesGetManyDto>(`/api/admin/tables`);

    items.value[0].items = response.data.tables.map((table) => ({
      label: table.name,
      command: () => {
        router.push(table.name);
      },
    }));
  } catch (error) {
    console.error(error);
  }
});
</script>

<template>
  <div class="flex p-2 gap-2">
    <div class="card text-sm">
      <Menu :model="items" />
    </div>
    <div class="flex-grow">
      <RouterView />
    </div>
  </div>
</template>
