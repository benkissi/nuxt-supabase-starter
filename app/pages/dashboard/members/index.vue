<script setup lang="ts">
const activeTab = ref<string>("members");

const tabItems = [
  { label: "Members", slot: "members", value: "members" },
  { label: "Invitations", slot: "invitations", value: "invitations" },
];


</script>

<template>
  <NuxtLayout name="dashboard">
    <div class="w-full">
      <UDashboardNavbar title="Members" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
      <UTabs
        v-model="activeTab"
        :items="tabItems"
        :unmount-on-hide="false"
        variant="link"
        class="flex-1 flex flex-col min-h-0"
        :ui="{
          content: 'flex-1 min-h-0 overflow-y-auto overflow-x-hidden',
        }"
      >
        <template #members>
          <MembersTable />
        </template>

        <template #invitations>
          <InvitationsTable />
        </template>
      </UTabs>
    </div>
  </NuxtLayout>
</template>
