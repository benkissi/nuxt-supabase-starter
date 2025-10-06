<script setup lang="ts">
const { defaultMenus } = useAppMenu();

const user = useSupabaseUser();
// const authStore = useAuthStore();

const open = ref(false);

</script>

<template>
  <UDashboardGroup class="h-screen w-full flex">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <DashboardTeams :collapsed="collapsed" />
      </template>
      <template #default="state">
        <UDashboardSearchButton
          :collapsed="state?.collapsed"
          class="bg-transparent ring-default"
        />
        <UNavigationMenu
          :collapsed="state?.collapsed"
          :items="defaultMenus"
          orientation="vertical"
          tooltip
          popover
        />
      </template>
      <template #footer="{ collapsed }">
        <DashboardUserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>
    <div class="flex flex-col flex-1 min-h-0 pb-1">
      <div class="flex-1 overflow-auto">
        <slot />
      </div>
      <div class="text-center text-sm text-gray-400">
        <p>v1.0.0</p>
      </div>
    </div>
  </UDashboardGroup>
</template>
