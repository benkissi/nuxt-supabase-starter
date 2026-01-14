<script setup lang="ts">
import type { DropdownMenuItem } from '#ui/types'

defineProps<{
  collapsed?: boolean
}>()

const colorMode = useColorMode()
const authStore = useAuthStore()
const { getPrivateImageUrl } = useSignedUrl()
const supabase = useSupabaseClient()
const router = useRouter()
const toast = useToast()
const showProfileModal = ref(false)

// Ensure member is fetched on mount if not available
onMounted(async () => {
  if (!authStore.currentMember && authStore.currentOrganization?.id && authStore.user) {
    await authStore.fetchCurrentMember()
  }
})

// Get user data from current member
const user = computed(() => {
  const member = authStore.currentMember;
  if (!member) {
    return {
      name: "User",
      avatar: undefined,
    };
  }

  const account = member.account as
    | { name?: string; image?: { path?: string; bucket?: string } }
    | null
    | undefined;
  // Check member.name first (like members table does), then account.name, then email
  const name = (member as any).name || account?.name || member.email || "User";
  const image = account?.image as
    | { path?: string; bucket?: string }
    | null
    | undefined;

  return {
    name,
    avatar:
      image?.path && image?.bucket
        ? {
            src: "", // Will be set by async computed
            alt: name,
          }
        : undefined,
  };
});

// Get signed URL for avatar
const avatarUrl = ref<string | null>(null);

watch(
  () => authStore.currentMember,
  async (member) => {
    if (!member) {
      avatarUrl.value = null;
      return;
    }

    const account = member.account as
      | { image?: { path?: string; bucket?: string } }
      | null
      | undefined;
    const image = account?.image as
      | { path?: string; bucket?: string }
      | null
      | undefined;

    if (image?.path && image?.bucket) {
      try {
        avatarUrl.value = await getPrivateImageUrl(image.bucket, image.path);
      } catch (error) {
        console.error("Failed to get signed URL for avatar:", error);
        avatarUrl.value = null;
      }
    } else {
      avatarUrl.value = null;
    }
  },
  { immediate: true, deep: true }
);

// Helper function to get user initials
const getUserInitials = (name: string): string => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    const first = parts[0]?.[0];
    const last = parts[parts.length - 1]?.[0];
    if (first && last) {
      return (first + last).toUpperCase();
    }
  }
  return name.substring(0, 2).toUpperCase();
};

// Computed user with avatar URL
const userWithAvatar = computed(() => {
  const baseUser = user.value;
  return {
    ...baseUser,
    avatar: avatarUrl.value
      ? {
          src: avatarUrl.value,
          alt: baseUser.name,
        }
      : {
          text: getUserInitials(baseUser.name),
          alt: baseUser.name,
        },
  };
});

// Logout function
const handleLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    
    toast.add({
      title: "Logged out",
      description: "You have been successfully logged out",
      color: "success",
    });
    
    // Navigate to login page
    await router.push("/auth/login");
  } catch (error) {
    console.error("Error during logout:", error);
    toast.add({
      title: "Logout failed",
      description: error instanceof Error ? error.message : "Could not log out. Please try again.",
      color: "error",
    });
  }
};

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      type: "label",
      label: userWithAvatar.value.name,
      avatar: userWithAvatar.value.avatar,
    },
  ],
  [
    {
      label: "Profile",
      icon: "i-lucide-user",
      onSelect: () => {
        showProfileModal.value = true;
      },
    },
  ],
  [
    {
      label: "Appearance",
      icon: "i-lucide-sun-moon",
      children: [
        {
          label: "Light",
          icon: "i-lucide-sun",
          type: "checkbox",
          checked: colorMode.value === "light",
          onSelect(e: Event) {
            e.preventDefault();

            colorMode.preference = "light";
          },
        },
        {
          label: "Dark",
          icon: "i-lucide-moon",
          type: "checkbox",
          checked: colorMode.value === "dark",
          onUpdateChecked(checked: boolean) {
            if (checked) {
              colorMode.preference = "dark";
            }
          },
          onSelect(e: Event) {
            e.preventDefault();
          },
        },
      ],
    },
  ],
  [
    {
      label: "Log out",
      icon: "i-lucide-log-out",
      onSelect: () => {
        handleLogout();
      },
    },
  ],
]);
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      v-bind="{
        ...userWithAvatar,
        label: collapsed ? undefined : userWithAvatar?.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down',
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed',
      }"
    />

    <template #chip-leading="{ item }">
      <span
        :style="{
          '--chip-light': `var(--color-${(item as any).chip}-500)`,
          '--chip-dark': `var(--color-${(item as any).chip}-400)`
        }"
        class="ms-0.5 size-2 rounded-full bg-(--chip-light) dark:bg-(--chip-dark)"
      />
    </template>
  </UDropdownMenu>

  <!-- Profile Modal -->
  <DashboardProfileModal v-model:open="showProfileModal" />
</template>