<script setup lang="ts">

</script>

<template>
  <NuxtLayout name="dashboard">
    <div class="w-full">
      <UDashboardNavbar title="Overview" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
      <UDashboardToolbar>
        <template #left>
            <div></div>
        </template>
      </UDashboardToolbar>
    </div>
  </NuxtLayout>
</template>