<script setup lang="ts">
defineOptions({ name: "DashboardFolderCard" });
interface Folder {
  id: number;
  name: string;
  tags: string[] | null;
  is_public: boolean;
  widget_id: number | null;
}

const props = defineProps<{
  folder: Folder;
  count: number;
  canEdit?: boolean;
  canDelete?: boolean;
}>();

const emit = defineEmits<{
  (e: "view" | "edit" | "delete", folder: Folder): void;
}>();

function onView() {
  emit("view", props.folder);
}

function onEdit() {
  emit("edit", props.folder);
}

function onDelete() {
  emit("delete", props.folder);
}
</script>

<template>
  <UCard class="w-full">
    <div class="flex items-start justify-between">
      <div>
        <p class="font-medium">{{ folder.name }}</p>
        <div class="mt-2 flex flex-wrap gap-1">
          <UBadge v-for="t in folder.tags || []" :key="t" size="sm">{{
            t
          }}</UBadge>
        </div>
        <p class="text-sm text-gray-500 mt-2">
          Files: {{ count }} · Accessible to all members:
          {{ folder.is_public ? "Yes" : "No" }}
        </p>
      </div>
      <div class="flex flex-col gap-2">
        <UButton size="xs" @click="onView">View</UButton>
        <UButton
          v-if="canEdit"
          size="xs"
          variant="soft"
          color="neutral"
          @click="onEdit"
          >Edit</UButton
        >
        <UButton
          v-if="canDelete"
          size="xs"
          variant="soft"
          color="error"
          @click="onDelete"
          >Delete</UButton
        >
      </div>
    </div>
  </UCard>
</template>
