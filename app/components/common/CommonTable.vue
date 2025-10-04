<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
// Minimal local TableColumn shape compatible with Nuxt UI UTable
type TableColumn = {
  accessorKey: string;
  header?: string | ((ctx?: unknown) => unknown);
  cell?: (ctx: { row: { getValue: (key: string) => unknown; original: any } }) => unknown;
};

const props = defineProps<{
  data: Record<string, unknown>[];
  columns: TableColumn[];
  loading?: boolean;
  total?: number;
  pageSizeOptions?: number[];
  server?: boolean;
  emptyText?: string;
  flush?: boolean;
}>();

const pageModel = defineModel<number>("page", { default: 1 });
const pageSizeModel = defineModel<number>("pageSize", { default: 10 });
const emit = defineEmits<{
  (e: "rowClick", row: Record<string, unknown>): void;
}>();

const totalRecords = computed(() => props.total ?? props.data.length);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalRecords.value / pageSizeModel.value))
);

watch([totalPages, pageModel], () => {
  if (pageModel.value > totalPages.value) pageModel.value = totalPages.value;
  if (pageModel.value < 1) pageModel.value = 1;
});

const clientPaginatedData = computed(() => {
  if (props.server) return props.data;
  const start = (pageModel.value - 1) * pageSizeModel.value;
  return props.data.slice(start, start + pageSizeModel.value);
});
function handleRowClick(row: Record<string, unknown>) {
  emit("rowClick", row);
}
const tableData = computed(() => clientPaginatedData.value);
</script>

<template>
  <div :class="['flex flex-col gap-3', !flush && 'p-2']">
    <!-- Header slot (actions, filters, etc.) -->
    <div
      v-if="$slots.header || $slots.actions"
      class="flex items-center justify-between gap-2"
    >
      <div v-if="$slots.header" class="flex-1">
        <slot name="header" />
      </div>
      <div v-if="$slots.actions" class="flex items-center gap-2">
        <slot name="actions" />
      </div>
    </div>

    <div class="relative">
      <!-- <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-gray-900/40 z-10">
        <span class="text-sm text-gray-500">Loading...</span>
      </div> -->

      <UTable
        :data="tableData"
        :columns="columns"
        :loading="loading"
        loading-color="primary"
        loading-animation="carousel"
        class="w-full"
        :ui="{
          th: 'text-xs font-semibold uppercase tracking-wide cursor-pointer',
          td: 'align-top text-sm',
        }"
        @row-click="handleRowClick"
      >
        <template #empty>
          <div class="py-10 text-center text-sm text-gray-500">
            <slot name="empty">{{ emptyText || "No data found" }}</slot>
          </div>
        </template>
        <!-- Consumers should format cells via columns.cell like in Nuxt UI examples -->
      </UTable>
    </div>

    <!-- Pagination footer -->
    <div
      v-if="totalRecords > pageSizeModel"
      class="flex items-center justify-between gap-4"
    >
      <div class="text-xs text-gray-500">
        Page {{ pageModel }} of {{ totalPages }} · Showing
        <span>{{ server ? data.length : tableData.length }}</span>
        of {{ totalRecords }}
      </div>
      <div class="flex items-center gap-2">
        <div v-if="pageSizeOptions?.length" class="flex items-center gap-1">
          <span class="text-xs text-gray-500">Rows:</span>
          <USelect
            v-model="pageSizeModel"
            :options="pageSizeOptions.map((v) => ({ label: v, value: v }))"
            size="xs"
          />
        </div>
        <UPagination
          v-model="pageModel"
          :page-count="pageSizeModel"
          :total="totalRecords"
          :disabled="loading"
          size="sm"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Optional minimal styling hook; stripe handled via prop by user if desired */
</style>
