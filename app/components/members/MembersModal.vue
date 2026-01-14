<script setup lang="ts">
import {
  MemberSchema,
  type MemberSchemaType,
} from "~/utils/schemas/forms/members.schema";

import type { IMember } from "~/utils/types/members.type";

interface IProps {
  member?: IMember | null;
}
const props = withDefaults(defineProps<IProps>(), {
  member: null,
});

const show = defineModel("show", {
  type: Boolean,
  default: false,
});

const state = reactive<MemberSchemaType>({
  email: "",
  name: "",
  role: "viewer",
  job_title: "",
});

const isEditMode = computed(() => !!props.member);  

const fields = computed(() => [
  {
    name: "email",
    label: "Email",
    type: "text",
    required: true,
    placeholder: "Member email",
    disabled: isEditMode.value,
  },
  {
    name: "name",
    label: "Name",
    type: "text",
    required: true,
    placeholder: "Full name",
    disabled: isEditMode.value,
  },
  {
    name: "job_title",
    label: "Job Title",
    type: "text",
    required: false,
    placeholder: "Job title (optional)",
  },
  {
    name: "role",
    label: "Role",
    type: "select",
    placeholder: "Select a role",
    labelKey: "label",
    valueKey: "value",
    options: [
      { label: "Admin", value: "admin" },
      { label: "Editor", value: "editor" },
      { label: "Viewer", value: "viewer" },
      { label: "Owner", value: "owner" },
    ],
    required: true,
  },
]);

const api = useApi();
const toast = useToast();
const updatingMember = ref(false);

const handleSubmit = async () => {
  if (!props.member?.id) {
    toast.add({
      title: "Error",
      description: "Invalid member",
      color: "error",
    });
    return;
  }

  try {
    updatingMember.value = true;
    await api.members.updateMember(props.member.id, {
      role: state.role,
      job_title: state.job_title || null,
    });
    toast.add({
      title: "Success",
      description: `Updated ${state.name}'s profile`,
      color: "success",
    });
    show.value = false;
    // Emit event to refresh members table
    window.dispatchEvent(new CustomEvent("memberUpdated"));
  } catch (error: any) {
    toast.add({
      title: "Error",
      description: error.message || "Failed to update member",
      color: "error",
    });
  } finally {
    updatingMember.value = false;
  }
};

const fieldTypes: Record<string, string | Component> = {
  select: resolveComponent("USelect"),
  select_menu: resolveComponent("USelectMenu"),
  text: resolveComponent("UInput"),
};

watch(
  () => props.member,
  (newMember) => {
    if (newMember) {
      state.email = newMember.email;
      state.name = newMember.name;
      state.role = newMember.role;
      state.job_title = newMember.job_title || "";
    } else {
      state.email = "";
      state.name = "";
      state.role = "viewer";
      state.job_title = "";
    }
  },
  { immediate: true }
);
</script>

<template>
  <UModal v-model:open="show" :title="isEditMode ? 'Edit Member' : 'Invite Member'" size="md">
    <template #body>
      <UForm
        :schema="MemberSchema"
        :state="state"
        class="space-y-4"
        @submit="handleSubmit"
      >
        <UFormField
          v-for="field in fields"
          :key="field.name"
          :label="field.label"
          :name="field.name"
        >
          <component
            :is="fieldTypes[field.type]"
            :v-model="(state as Record<string, any>)[field.name]"
            :name="field.name"
            :default-value="(state as Record<string, any>)[field.name]"
            :required="field.required"
            :disabled="field.disabled"
            :label-key="field.labelKey"
            :value-key="field.valueKey"
            :placeholder="field.placeholder"
            :items="field.options"
            class="w-full"
          />
        </UFormField>
        <div class="flex justify-end mt-10">
          <UButton
            type="button"
            label="Cancel"
            color="neutral"
            variant="outline"
            class="mr-3"
            @click="show = false"
          />
          <UButton
            type="submit"
            :label="isEditMode ? 'Update Member' : 'Send Invite'"
            color="primary"
            :loading="updatingMember"
            :disabled="updatingMember"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
