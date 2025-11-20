import { Chart, registerables } from "chart.js";

export default defineNuxtPlugin({
    setup(nuxtApp) {
        Chart.register(...registerables);
        console.log("chartjs initialized");
    },
    enforce: "pre",
});
