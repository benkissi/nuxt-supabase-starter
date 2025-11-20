<script lang="ts" setup>
import type { ButtonProps } from "@nuxt/ui";

const mounted = useMounted();
const animatedArrowProps = ref({ size: "md", variant: "solid" });
const items = ref(listGenerate(5, (i) => `Element ${i}`));

function addItem() {
  items.value.push(`Element ${items.value.length}`);
}
function removeItem(index: number) {
  items.value.splice(index, 1);
}
</script>

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
    <div class="p-4">
      <ElementMorphGradient class="opacity-100"></ElementMorphGradient>
      <AnimateHeight>
        <div class="flex flex-col gap-4 w-full">
          <CommonReordable :items="items" class="">
            <template #item="{ item, index }">
              <div class="bg-muted w-full rounded-md p-2 flex items-center">
                <u-input
                  :model-value="item"
                  @update:model-value="(v) => items.splice(index, 1, v)"
                ></u-input>
                <u-button
                  color="error"
                  variant="ghost"
                  icon="material-symbols:delete-rounded"
                  size="sm"
                  class="ml-auto"
                  @click="() => removeItem(index)"
                ></u-button>
              </div>
            </template>
          </CommonReordable>
        </div>
      </AnimateHeight>
    </div>
  </NuxtLayout>
</template>
