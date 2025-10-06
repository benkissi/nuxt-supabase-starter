<script setup lang="ts">
import type { IInvitation } from "~/utils/types/members.type";

const api = useApi();

// const toast = useToast();

const showInvitationModal = ref(false);
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
];
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
    <MembersInviteModal v-model:show="showInvitationModal" @invitation-sent="refresh" />
  </div>
</template>
