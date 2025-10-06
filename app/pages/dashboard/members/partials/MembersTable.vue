<script setup lang="ts">
import type { IMember } from "~/utils/types/members.type";

const api = useApi();
const showAddModal = ref(false);
const memberToEdit = ref<IMember | null>(null);
const memberToDelete = ref<IMember | null>(null);
const showConfirmDelete = ref(false);
const deletingMember = ref(false);

const toast = useToast();

const { data, status, refresh } = useAsyncData("members", async () => {
  const res = await api.members.getMembers();
  return res;
});

type TableColumn = {
  accessorKey: string;
  header?: string | ((ctx?: unknown) => unknown);
  cell?: (ctx: {
    row: { getValue: (key: string) => unknown; original: IMember };
  }) => unknown;
};

const columns: TableColumn[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }: { row: { [key: string]: unknown; original: IMember } }) => {
      return h("div", { class: "flex items-center gap-3" }, [
        h(resolveComponent("CommonAsyncImage"), {
          path:
            (row.original as IMember).account.image?.path ||
            "/default-avatar.png",
          bucket: (row.original as IMember).account.image?.bucket || "avatars",
          alt: (row.original as IMember).name,
          class: "w-8 h-8 rounded-full object-cover",
        }),
        h("span", {}, (row.original as IMember).name),
      ]);
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }: { row: { [key: string]: unknown; original: IMember } }) =>
      (row.original as IMember).email,
  },
  {
    accessorKey: "job_title",
    header: "Job Title",
    cell: ({ row }: { row: { [key: string]: unknown; original: IMember } }) =>
      (row.original as IMember).job_title || "-",
  },
  { accessorKey: "role", header: "Role" },
  {
    accessorKey: "actions",
    header: "",
    cell({ row }: { row: { [key: string]: unknown; original: IMember } }) {
      return h(
        resolveComponent("UDropdownMenu"),
        {
          items: [
            {
              label: "Edit Profile",
              icon: "i-heroicons-pencil-square",
              onSelect: () => {
                showAddModal.value = true;
                memberToEdit.value = row.original;
              },
            },
            {
              label: "Remove Member",
              icon: "i-heroicons-trash",
              onSelect: () => {
                memberToDelete.value = row.original;
                showConfirmDelete.value = true;
              },
              show: row.original.role !== "owner",
            },
          ].filter(item => item.show !== false),
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

const pagination = reactive({
  page: 1,
  itemsPerPage: 10,
  total: 0,
});

const handleDeleteMember = async () => {
  try {
    deletingMember.value = true;
    await api.members.deleteMember(memberToDelete.value!.id);
    toast.add({
      title: "Member removed",
      description: `${memberToDelete.value?.name} has been removed from the organization.`,
      color: "success",
    });
    await refresh();
  } catch (error) {
    console.error("Failed to delete member:", error);
    toast.add({
      title: "Error",
      description:
        (error as { message?: string })?.message ||
        "Failed to delete member. Please try again.",
      color: "error",
    });
  } finally {
    deletingMember.value = false;
    showConfirmDelete.value = false;
    memberToDelete.value = null;
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
          <div class="text-sm text-gray-500">Manage Members</div>
          
        </div>
      </template>
    </CommonTable>
    <MembersModal v-model:show="showAddModal" :member="memberToEdit" />
    <CommonConfirmDelete
      v-model="showConfirmDelete"
      title="Remove Member"
      :loading="deletingMember"
      message="Are you sure you want to remove this member? This action cannot be undone."
      @confirm="handleDeleteMember"
    />
  </div>
</template>
