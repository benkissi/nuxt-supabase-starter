<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const supabase = useSupabaseClient();
const authStore = useAuthStore();
const user = useSupabaseUser();
const { getPrivateImageUrl } = useSignedUrl();
const toast = useToast();

const open = defineModel<boolean>("open", { default: false });

const currentMember = computed(() => authStore.currentMember);
const isAdmin = computed(() => {
  const role = currentMember.value?.role;
  return role === "admin" || role === "owner";
});

const loading = ref(false);
const uploadingAvatar = ref(false);
const avatarPreview = ref<string | null>(null);
const originalAvatarPreview = ref<string | null>(null);
const avatarFile = ref<File | null>(null);

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Invalid email").optional(),
});

type Schema = z.output<typeof schema>;

const state = reactive<{
  name: string;
  email?: string;
}>({
  name: "",
  email: "",
});

// Load current user data
watch([open, currentMember], async () => {
  if (open.value) {
    // If modal opens but no member data, try to load it first
    if (!currentMember.value) {
      if (authStore.currentOrganization?.id && user.value) {
        await authStore.fetchCurrentMember();
      }
    }

    // Load data from member if available, otherwise from user
    if (currentMember.value) {
      const account = currentMember.value.account as
        | { name?: string; image?: { path?: string; bucket?: string } }
        | null
        | undefined;

      // Get name from account, fallback to member name, then email, then user email
      state.name = account?.name || currentMember.value.name || currentMember.value.email || user.value?.email || "";
      
      // Get email from member, fallback to auth user email
      state.email = currentMember.value.email || user.value?.email || "";

      // Load avatar preview
      const image = account?.image as
        | { path?: string; bucket?: string }
        | null
        | undefined;

      if (image?.path && image?.bucket) {
        try {
          const url = await getPrivateImageUrl(image.bucket, image.path);
          avatarPreview.value = url;
          originalAvatarPreview.value = url;
        } catch (error) {
          console.error("Failed to load avatar:", error);
          avatarPreview.value = null;
          originalAvatarPreview.value = null;
        }
      } else {
        avatarPreview.value = null;
        originalAvatarPreview.value = null;
      }
    } else if (user.value) {
      // If no member data, use user data directly
      const fullName = user.value.user_metadata?.full_name || user.value.raw_user_meta_data?.full_name;
      state.name = fullName || user.value.email || "";
      state.email = user.value.email || "";
      avatarPreview.value = null;
      originalAvatarPreview.value = null;
    }

    avatarFile.value = null;
  }
}, { immediate: true });

// Watch avatarFile for preview
watch(avatarFile, (file) => {
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    // If file is cleared, restore original preview if it exists
    avatarPreview.value = originalAvatarPreview.value;
  }
});

// Upload avatar to storage
const uploadAvatar = async (userId: string): Promise<{ bucket: string; path: string } | null> => {
  if (!avatarFile.value) return null;

  try {
    uploadingAvatar.value = true;
    const file = avatarFile.value;
    const safeName = `${crypto.randomUUID()}_${file.name.replace(/\s+/g, "_")}`;
    const filePath = `${userId}/${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("user-images")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    return { bucket: "user-images", path: filePath };
  } catch (error) {
    console.error("Error uploading avatar:", error);
    throw error;
  } finally {
    uploadingAvatar.value = false;
  }
};

// Update profile
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {
    loading.value = true;

    const authUser = await supabase.auth.getUser();
    if (!authUser.data.user) {
      throw new Error("User not authenticated");
    }

    const userId = authUser.data.user.id;

    // Try to get account ID from currentMember, or fetch it directly
    let accountId: string | null = null;
    
    if (currentMember.value?.account) {
      accountId = (currentMember.value.account as { id: string })?.id;
    } else {
      // If no member data, fetch account directly
      const { data: account, error: accountFetchError } = await supabase
        .from("accounts")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (accountFetchError) {
        throw new Error("Failed to fetch account");
      }

      if (!account) {
        throw new Error("Account not found. Please complete onboarding first.");
      }

      accountId = account.id;
    }

    if (!accountId) {
      throw new Error("Account not found");
    }

    // Upload avatar if a new file was selected
    let imageData = null;
    if (avatarFile.value) {
      imageData = await uploadAvatar(userId);
    }

    // Update account (name and image)
    const accountUpdate: { name: string; image?: { bucket: string; path: string } } = {
      name: event.data.name,
    };

    if (imageData) {
      accountUpdate.image = imageData;
    }

    const { error: accountError } = await supabase
      .from("accounts")
      .update(accountUpdate)
      .eq("id", accountId);

    if (accountError) {
      throw accountError;
    }

    // Update email if admin and email was provided and member data exists
    if (currentMember.value && isAdmin.value && event.data.email && event.data.email !== currentMember.value.email) {
      const { error: memberError } = await supabase
        .from("organization_members")
        .update({ email: event.data.email })
        .eq("id", currentMember.value.id);

      if (memberError) {
        throw memberError;
      }
    }

    // Refresh member data if it exists
    if (authStore.currentOrganization?.id && user.value) {
      await authStore.fetchCurrentMember();
    }

    toast.add({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
      color: "success",
    });

    open.value = false;
  } catch (error: any) {
    console.error("Error updating profile:", error);
    toast.add({
      title: "Error",
      description: error.message || "Failed to update profile. Please try again.",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};

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

const reset = () => {
  avatarFile.value = null;
  avatarPreview.value = originalAvatarPreview.value;
};
</script>

<template>
  <UModal v-model:open="open" title="Edit Profile">
    <template #body>
      <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
        <!-- Avatar Upload -->
        <div class="flex flex-col items-center gap-4">
          <div class="relative">
            <UAvatar
              v-if="avatarPreview"
              :src="avatarPreview"
              :alt="state.name || 'User'"
              size="xl"
              class="ring-2 ring-gray-200 dark:ring-gray-800"
            />
            <UAvatar
              v-else
              :text="getUserInitials(state.name || 'User')"
              :alt="state.name || 'User'"
              size="xl"
              class="ring-2 ring-gray-200 dark:ring-gray-800"
            />
            <div
              v-if="uploadingAvatar"
              class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full"
            >
              <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin text-white" />
            </div>
          </div>
          <UFileUpload
            v-model="avatarFile"
            accept="image/*"
            variant="button"
            label="Upload Avatar"
          />
        </div>

        <!-- Name Field -->
        <UFormField label="Name" name="name" required>
          <UInput
            v-model="state.name"
            placeholder="Your full name"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <!-- Email Field -->
        <UFormField label="Email" name="email">
          <UInput
            v-if="isAdmin"
            v-model="state.email"
            type="email"
            placeholder="your.email@example.com"
            size="lg"
            class="w-full"
            :disabled="loading"
          />
          <UInput
            v-else
            :model-value="state.email"
            type="email"
            disabled
            size="lg"
            class="w-full"
          />
          <template #help>
            <p v-if="isAdmin" class="text-xs text-gray-500 dark:text-gray-400">
              As an admin, you can update your email address
            </p>
            <p v-else class="text-xs text-gray-500 dark:text-gray-400">
              Contact an admin to update your email address
            </p>
          </template>
        </UFormField>

        <!-- Submit Button -->
        <div class="flex justify-end gap-3 pt-4">
          <UButton
            type="button"
            color="neutral"
            variant="outline"
            label="Cancel"
            @click="open = false"
          />
          <UButton
            type="submit"
            label="Save Changes"
            :loading="loading || uploadingAvatar"
            :disabled="loading || uploadingAvatar"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
