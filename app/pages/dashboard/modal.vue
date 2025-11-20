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
    <div class="w-full flex flex-col gap-4 items-center mt-4 p-4">
      <u-field-group>
        <u-button label="Open modal" @click="task" variant="subtle"></u-button>
        <u-select
          :items="items"
          placeholder="Pick an argument"
          class="min-w-[8rem]"
          v-model="arg"
        ></u-select>
      </u-field-group>

      <CommonModal
        ref="modalEl"
        title="A new cool modal"
        description="This is a very cool modal description that represents some information"
      >
        <template #body="{ arg }">
          <div class="min-h-[10rem]">Argument: {{ arg ?? "undefined" }}</div>
          <CommonModal
            ref="nestedModal"
            title="This is a nested modal"
            description="This nested modal has the argument equal to double the initial argument"
          >
            <template #body="{ arg }">Argument: {{ arg }}</template>
          </CommonModal>
        </template>
        <template #footer="{ arg }">
          <u-button
            label="Open nested"
            color="neutral"
            @click="() => nestedModalEl?.open(arg * 2)"
          ></u-button>
        </template>
      </CommonModal>
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import type { CommonModalElement } from "~/components/common/CommonModal.vue";
const modalEl = useTemplateRef<CommonModalElement>("modalEl");
const nestedModalEl = useTemplateRef<CommonModalElement>("nestedModal");
const items = listGenerate(10, (i) => i);
const arg = ref();
async function task() {
  modalEl.value?.open(arg.value);
}
</script>

<style></style>
