<script setup lang="ts">
import type { IInvitation } from "~/utils/types/members.type";

const api = useApi();

const toast = useToast();
const invitationToEdit = ref<IInvitation | null>(null);
const invitationToDelete = ref<IInvitation | null>(null);
const showInvitationModal = ref(false);
const showConfirmDelete = ref(false);
const deletingMember = ref(false);

const pagination = reactive({
  page: 1,
  itemsPerPage: 10,
  total: 0,
});

const { data, status, refresh } = useAsyncData("imvitations", async () => {
  const res = await api.members.getInvitations();
  return res;
});

type TableColumn = {
  accessorKey: string;
  header?: string | ((ctx?: unknown) => unknown);
  cell?: (ctx: {
    row: { getValue: (key: string) => unknown; original: IInvitation };
  }) => unknown;
};

const columns: TableColumn[] = [
  { accessorKey: "email", header: "Email" },
  { accessorKey: "status", header: "Status",  cell: ({ row }) => {
      const color = {
        pending: "warning" as const,
        rejected: "error" as const,
        accepted: "success" as const
      }[row.getValue("status") as string];

      return h(resolveComponent("UBadge"), { class: "capitalize", variant: "subtle", color }, () =>
        row.getValue("status")
      );
    },},
  { accessorKey: "role", header: "Role" },
   {
    accessorKey: "actions",
    header: "",
    cell({ row }: { row: { [key: string]: unknown; original: IInvitation } }) {
      return h(
        resolveComponent("UDropdownMenu"),
        {
          items: [
            {
              label: "Edit Profile",
              icon: "i-heroicons-pencil-square",
              onSelect: () => {
                showInvitationModal.value = true;
                invitationToEdit.value = row.original;
              },
            },
            {
              label: "Remove invite",
              icon: "i-heroicons-trash",
              onSelect: () => {
                invitationToDelete.value = row.original;
                showConfirmDelete.value = true;
              }
            },
          ],
        },
        {
          default: () =>
            h(resolveComponent("UButton"), {
              icon: "i-heroicons-ellipsis-vertical-20-solid",
              color: "gray",
              variant: "ghost",
              size: "xs",
            }),
        }
      );
    },
  },
];

const handleDeleteMember = async () => {
  if (!invitationToDelete.value) return;
    try {
    deletingMember.value = true;
    await api.members.revokeInvite(invitationToDelete.value.id);
    toast.add({
      title: "Invitation revoked",
      description: `Invitation to ${invitationToDelete.value?.email} has been revoked.`,
      color: "success",
    });
    refresh();
  } catch (error) {
    console.error("Error deleting invitation:", error);
    toast.add({
      title: "Error",
      description:
        (error as { message?: string })?.message ||
        "Failed to remove invitation. Please try again.",
      color: "error",
    });
  } finally {
    showConfirmDelete.value = false;
    invitationToDelete.value = null;
    deletingMember.value = false;
  }
};
</script>

<template>
  <div>
    <CommonTable
      v-model:page="pagination.page"
      :data="data || []"
      :columns="columns"
      :total="pagination.total"
      :page-size="pagination.itemsPerPage"
      :empty-text="'No dynamic fields'"
      :loading="status === 'pending'"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-500">Manage Invitations</div>
          <UButton
            icon="i-heroicons-plus"
            variant="soft"
            label="Add an invitation"
            @click="showInvitationModal = true"
          />
        </div>
      </template>
    </CommonTable>
    <MembersInviteModal  v-model:show="showInvitationModal" :invite="invitationToEdit" @invitation-sent="refresh" />
     <CommonConfirmDelete
      v-model="showConfirmDelete"
      title="Remove Member"
      :loading="deletingMember"
      message="Are you sure you want to remove this member? This action cannot be undone."
      @confirm="handleDeleteMember"
    />
  </div>
</template>
