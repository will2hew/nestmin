<script setup lang="ts">
import axios from "axios";
import Menu from "primevue/menu";
import { MenuItem } from "primevue/menuitem";
import { onMounted, ref } from "vue";
import { RouterView, useRouter } from "vue-router";
import { TablesGetManyDto } from "../../api/lib/dto/tables-get-many.dto";

const router = useRouter();
const items = ref<MenuItem[]>([
  {
    label: "Tables",
    items: [],
  },
]);

onMounted(async () => {
  try {
    const response = await axios.get<TablesGetManyDto>(`tables`);

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
  <div class="flex p-2 gap-2 w-full">
    <div class="card text-sm shrink-0">
      <Menu :model="items"></Menu>
    </div>
    <div class="flex-grow overflow-x-auto">
      <RouterView />
    </div>
  </div>
</template>
