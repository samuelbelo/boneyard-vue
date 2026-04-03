import { createApp } from "vue";
import App from "./App.vue";
import { BoneyardPlugin } from "../src/vue.ts";

const app = createApp(App);
app.use(BoneyardPlugin);
app.mount("#app");
