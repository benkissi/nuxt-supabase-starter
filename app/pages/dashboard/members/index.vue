<script setup lang="ts">
import CommonTable from "~/components/common/CommonTable.vue";
import type { IMember } from "~/utils/types/members.type";

const api = useApi();
const showAddModal = ref(false);
const memberToEdit = ref<IMember | null>(null);
const memberToDelete = ref<IMember | null>(null);
const showConfirmDelete = ref(false);
const deletingMember = ref(false);


const { data, status } = useAsyncData("members", async () => {
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
          path: (row.original as IMember).account.image?.path || "/default-avatar.png",
          bucket: (row.original as IMember).account.image?.bucket || "avatars",
          alt: (row.original as IMember).name,
          class: "w-8 h-8 rounded-full object-cover",
        }),
        h("span", {}, (row.original as IMember).name),
      ]);
    },
  },
  { accessorKey: "email", header: "Email", cell: ({ row }: { row: { [key: string]: unknown; original: IMember } }) => (row.original as IMember).email },
  { accessorKey: "job_title", header: "Job Title", cell: ({ row }: { row: { [key: string]: unknown; original: IMember } }) => (row.original as IMember).job_title || '-' },
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

const pagination = reactive({
  page: 1,
  itemsPerPage: 10,
  total: 0,
});

const handleDeleteMember = async () => { }
</script>

<template>
  <NuxtLayout name="dashboard">
    <div class="w-full">
      <UDashboardNavbar title="Members" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <template #right>
          
        </template>
      </UDashboardToolbar>
      <CommonTable
        v-model:page="pagination.page"
        :data="data || []"
        :columns="columns"
        :total="pagination.total"
        :page-size="pagination.itemsPerPage"
        :empty-text="'No dynamic fields'"
        :loading="status === 'pending'"
        ><template #header>
          <div class="flex justify-end items-center">
            <UButton variant="outline" size="sm" @click="showAddModal = true">
              Add a member
            </UButton>
          </div>
        </template>
      </CommonTable>
      <MembersInviteModal :member="memberToEdit" v-model:show="showAddModal" />
      <CommonConfirmDelete
      v-model="showConfirmDelete"
      :loading="deletingMember"
      @cancel="showConfirmDelete = false"
      @confirm="handleDeleteMember"
    />
    </div>
  </NuxtLayout>
</template>
