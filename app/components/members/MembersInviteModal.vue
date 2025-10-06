<script setup lang="ts">
import {
  InviteSchema,
  type InviteSchemaType,
} from "~/utils/schemas/forms/members.schema";

interface IProps {
  member?: {
    id: string;
    email: string;
    name: string;
    role: "admin" | "editor" | "viewer";
  } | null;
}
const props = withDefaults(defineProps<IProps>(), {
  member: null,
});

const show = defineModel("show", {
  type: Boolean,
  default: false,
});

const state = reactive<InviteSchemaType>({
  email: "",
  name: "",
  role: "viewer",
});

const isEditMode = computed(() => !!props.member);  

const fields = ref([
  {
    name: "email",
    label: "Email",
    type: "text",
    required: true,
    placeholder: "Member email",
  },
  {
    name: "name",
    label: "Name",
    type: "text",
    required: true,
    placeholder: "Full name",
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

const handleSubmit = async () => {};

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
    } else {
      state.email = "";
      state.name = "";
      state.role = "viewer";
    }
  },
  { immediate: true }
);
</script>

<template>
  <UModal v-model:open="show" :title="isEditMode ? 'Edit Member' : 'Invite Member'" size="md">
    <template #body>
      <UForm
        :schema="InviteSchema"
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
            label="Send Invite"
            color="primary"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
