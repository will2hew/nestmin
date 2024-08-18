<template>
  <form class="grid gap-2 w-[400px]">
    <template v-for="column in tableDetails.columns">
      <label :for="column.name">{{ column.name }}</label>
      <InputText
        v-if="column.generated"
        :id="column.name"
        placeholder="generated"
        disabled
      />
      <InputText
        v-else
        :id="column.name"
        :placeholder="column.name"
        :required="!column.nullable"
      />
    </template>
    <Button type="submit" label="Add" />
  </form>
</template>
<script setup lang="ts">
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { TablesGetOneDto } from "../../../lib/dto/tables-get-one.dto";

interface Props {
  tableDetails: TablesGetOneDto;
}

defineProps<Props>();
</script>
