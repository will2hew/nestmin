<template>
  <form
    @submit.prevent="emits('add-row', formData)"
    class="grid gap-2 w-[400px]"
  >
    <template v-for="column in tableDetails.columns">
      <div>
        <label :for="column.name">{{ column.name }}</label>
        <Badge v-if="column.relation" class="ml-1" severity="info">FK</Badge>
        <Badge v-if="column.nullable" class="ml-1" severity="secondary">
          nullable
        </Badge>
      </div>
      <InputText
        v-if="column.generated"
        v-model="formData[column.name]"
        :id="column.name"
        placeholder="generated"
        disabled
      />
      <InputText
        v-else
        v-model="formData[column.name]"
        :id="column.name"
        :placeholder="column.name"
        :required="!column.nullable"
      />
    </template>
    <Button type="submit" label="Add" />
  </form>
</template>
<script setup lang="ts">
import Badge from "primevue/badge";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import { reactive } from "vue";
import { TablesGetOneDto } from "../../../lib/dto/tables-get-one.dto";

const formData = reactive<any>({});

interface Props {
  tableDetails: TablesGetOneDto;
}

defineProps<Props>();

const emits = defineEmits(["add-row"]);
</script>
