import Aura from "@primevue/themes/aura";
import PrimeVue from "primevue/config";
import { createApp } from "vue";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import App from "./App.vue";
import "./styles.css";
import Table from "./views/Table.vue";
import TableList from "./views/TableList.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "table-list",
    component: TableList,
  },
  {
    path: "/:name",
    name: "table",
    component: Table,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

createApp(App)
  .use(router)
  .use(PrimeVue, {
    theme: {
      preset: Aura,
    },
  })
  .mount("#app");
