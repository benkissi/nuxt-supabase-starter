<script setup lang="ts">
/**
 * A reusable confirmation modal component for delete actions.
 * Usage:
 * <ConfirmDeleteModal
 *   v-model="showDeleteModal"
 *   title="Delete Item"
 *   description="Are you sure you want to delete this item? This action cannot be undone."
 *   :loading="deleting"
 *   @confirm="handleDelete"
 *   @cancel="showDeleteModal = false"
 * />
 */

interface Props {
  /** Controls the modal visibility */
  modelValue: boolean;
  /** The title of the modal */
  title?: string;
  /** The description/content of the confirmation modal */
  description?: string;
  /** Name of the item being deleted */
  itemName?: string;
  /** If true, shows loading spinner on the delete button */
  loading?: boolean;
  /** Custom text for the confirm button */
  confirmText?: string;
  /** Custom text for the cancel button */
  cancelText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Confirm Delete",
  description:
    "Are you sure you want to delete this item? This action cannot be undone.",
  itemName: "",
  loading: false,
  confirmText: "Delete",
  cancelText: "Cancel",
});

const emit = defineEmits<{
  /** Update the v-model value */
  "update:modelValue": [value: boolean];
  /** Emitted when user confirms the delete action */
  confirm: [];
  /** Emitted when user cancels the delete action */
  cancel: [];
}>();

// Handle modal visibility changes
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

function onConfirm() {
  emit("confirm");
}

function onCancel() {
  emit("cancel");
  isOpen.value = false;
}
</script>

<template>
  <UModal :title="title" v-model:open="isOpen" size="sm">
    <template #body>
      <div class="p-4">
        <div class="flex flex-col items-center">
          <!-- Alert icon -->
          <div class="flex-shrink-0 mr-3">
            <div
              class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"
            >
              <UIcon name="i-heroicons-trash" class="size-5 text-red-600" />
            </div>
          </div>

          <div class="mt-4 text-sm text-gray-500">
            <p>{{ description }}</p>
            <p v-if="itemName" class="mt-1 font-medium text-center">
              {{ itemName }}
            </p>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <!-- Action buttons -->
      <div class="mt-6 flex justify-end gap-3 w-full">
        <UButton color="neutral" variant="ghost" @click="onCancel">
          {{ cancelText }}
        </UButton>

        <UButton color="error" :loading="loading" @click="onConfirm">
          {{ confirmText }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
