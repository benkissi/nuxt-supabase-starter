<template>
  <NuxtLayout name="dashboard">
    <div class="w-full">
      <UDashboardNavbar title="Overview" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <template #left>
          <div></div>
        </template>
      </UDashboardToolbar>
    </div>
    <div class="w-full flex flex-col gap-4 items-center mt-4">
      <!-- <AsyncButton :promise="task">Expand container</AsyncButton> -->
      <UButton
        label="Expand container"
        @click="activated = !activated"
      ></UButton>
      <AnimateHeight
        class="w-full bg-muted max-w-2xl border border-default rounded-lg"
      >
        <div
          class="w-full"
          :class="{ 'h-[20rem]': activated, 'h-[4rem]': !activated }"
        ></div>
      </AnimateHeight>
      <AnimateEnter v-for="i in 10" class="max-w-2xl">
        <u-card class="" variant="subtle">
          <template #header>
            <motion.p :variants="item">Card {{ i }}</motion.p>
          </template>
          <template #default>
            <div class="flex flex-col w-full items-stretch gap-2">
              <motion.p :variants="item"
                >Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
                Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
                Lorem Ipsum Lorem Ipsum
              </motion.p>
              <motion.div
                :variants="item"
                class="bg-muted h-[10rem] w-full rounded-md"
              ></motion.div>
            </div>
          </template>
        </u-card>
      </AnimateEnter>
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import { motion } from "motion-v";
const item = {
  hidden: { opacity: 0, transform: "translateX(-16px)" },
  show: { opacity: 1, transform: "translateX(0px)" },
  transition: { duration: 2, type: "spring", bounce: 0.25 },
};

const activated = ref(false);
async function task() {
  activated.value = true;
  await sleep(1000);
  activated.value = false;
}
</script>

<style></style>
