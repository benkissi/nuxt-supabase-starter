<script setup lang="ts">
import type { IInvitation } from "~/utils/types/members.type";

import {
  InviteSchema,
  type InviteSchemaType,
} from "~/utils/schemas/forms/members.schema";

interface IProps {
  invite?: IInvitation | null;
}

const props = withDefaults(defineProps<IProps>(), {
  invite: null,
});

const isEditMode = computed(() => !!props.invite);

const emit  = defineEmits(["invitationSent"]);
const show = defineModel("show", {
  type: Boolean,
  default: false,
});

const api = useApi();
const sendingInvite = ref(false);
const toast = useToast();

const state = reactive<InviteSchemaType>({
  email: "",
  role: "viewer",
});

const fields = ref([
  {
    name: "email",
    label: "Email",
    type: "text",
    required: true,
    placeholder: "Member email",
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
      { label: "Member", value: "member" },
      { label: "Owner", value: "owner" },
    ],
    required: true,
  },
]);

const reset = () => {
  state.email = "";
  state.role = "viewer";
};

const handleSubmit = async () => {
  try {
    sendingInvite.value = true;
    // TODO: update invite API call to use current organization ID
    await api.members.sendInvite({
      ...state,
      organization_id: "49141afb-a99b-4cf8-a5a9-9c8736964c8c",
    });
    toast.add({
      title: "Invite Sent",
      description: `Invitation sent to ${state.email}`,
      color: "success",
    });
    reset();
    emit("invitationSent");
  } catch (error) {
    toast.add({
      title: "Error",
      description:
        (error as { message?: string })?.message ||
        "Failed to send invite. Please try again.",
      color: "error",
    });
    console.error("Failed to send invite:", error);
  } finally {
    sendingInvite.value = false;
    show.value = false;
  }
};

const handleUpdate = async () => {
  try {
    if (!props.invite?.id) throw new Error("No invite ID provided");
    sendingInvite.value = true;
    // TODO: update invite API call to use current organization ID
    await api.members.updateInvite(props.invite.id, state);
    toast.add({
      title: "Invite Updated",
      description: `Invitation updated for ${state.email}`,
      color: "success",
    });
    reset();
    emit("invitationSent");
  } catch (error) {
    toast.add({
      title: "Error",
      description:
        (error as { message?: string })?.message ||
        "Failed to send invite. Please try again.",
      color: "error",
    });
    console.error("Failed to send invite:", error);
  } finally {
    sendingInvite.value = false;
    show.value = false;
  }
};

const onSubmit = () => {
  if (isEditMode.value) {
    handleUpdate();
  } else {
    handleSubmit();
  }
};

const fieldTypes: Record<string, string | Component> = {
  select: resolveComponent("USelect"),
  select_menu: resolveComponent("USelectMenu"),
  text: resolveComponent("UInput"),
};

watch(
  () => props.invite,
  (newInvite) => {
    if (newInvite) {
      state.email = newInvite.email;
      state.role = newInvite.role;
    } else {
      reset();
    }
  },
  { immediate: true }
);

</script>

<template>
  <UModal v-model:open="show" :title="isEditMode ? 'Edit Invite' : 'Send an invite'" size="md">
    <template #body>
      <UForm
        :schema="InviteSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          v-for="field in fields"
          :key="field.name"
          :label="field.label"
          :name="field.name"
        >
          <component
            :is="fieldTypes[field.type]"
            v-model="(state as Record<string, any>)[field.name]"
            :name="field.name"
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
            :label="isEditMode ? 'Update Invite' : 'Send Invite'"
            color="primary"
            :loading="sendingInvite"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
