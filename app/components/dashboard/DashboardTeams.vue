<script setup lang="ts">
import { ref, watchEffect } from "vue";
import type { DropdownMenuItem } from "@nuxt/ui";
import type { ICompany } from "~/utils/types/organization.type";

const props = defineProps<{
  collapsed?: boolean;
  organizations?: ICompany[];
}>();

const { getPrivateImageUrl } = useSignedUrl();
const authStore = useAuthStore();

const { currentOrganization } = storeToRefs(authStore);

const selectedIndex = ref(0)
const items = ref<DropdownMenuItem[]>([]);

const selectedTeam = computed(() => {
  if(items.value.length === 0) return null;
  return items.value[selectedIndex.value] as DropdownMenuItem;
})

watchEffect(async () => {
  const orgs = props.organizations ?? [];

  const orgItems = await Promise.all(
    orgs.map(async (org, i): Promise<DropdownMenuItem> => {
      let imageUrl = "/default-avatar.png";

      try {
        const url = await getPrivateImageUrl(
          org.image?.bucket || "organization-images",
          org.image?.path || ""
        );
        if (typeof url === "string") imageUrl = url;
      } catch (err) {
        console.error("Error fetching private image:", err);
      }

      return {
        type: "link",
        label: org.name,
        avatar: { src: imageUrl, alt: org.name },
        onSelect: () => {
          selectedIndex.value = i;
          currentOrganization.value = org;
          console.log(`Switched to organization: ${org.name}`);
        },
      };
    })
  );

  items.value = [
    ...orgItems,
    { type: "separator" },
    { type: "link", label: "Create team", icon: "i-lucide-circle-plus" },
    { type: "link", label: "Manage teams", icon: "i-lucide-cog" },
  ];
});
</script>




<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{
      content: collapsed ? 'w-40' : 'w-(--reka-dropdown-menu-trigger-width)',
    }"
  >
    <UButton
      :label="collapsed ? undefined : selectedTeam?.label"
      :avatar="{
        src: selectedTeam?.avatar?.src || '/default-avatar.png',
      }"
      :icon="selectedTeam?.icon"
      :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :class="[!collapsed && 'py-2']"
      :ui="{
        trailingIcon: 'text-dimmed',
      }"
    />
  </UDropdownMenu>
</template>
