<script setup lang="ts">
import type * as z from "zod";
import { loginEmailSchema } from "@/utils/schemas/forms/login.schema";
import type { FormSubmitEvent } from "@nuxt/ui";

const router = useRouter();
const route = useRoute();
const toast = useToast();

type Schema = z.output<typeof loginEmailSchema>;

const state = reactive<Partial<Schema>>({
  email: undefined,
});
const supabase = useSupabaseClient();
const loading = ref(false);
const fetchingInvitation = ref(false);
const emailDisabled = ref(false);

// Extract invitation token from redirect URL
const getInvitationToken = () => {
  const redirectParam = route.query.redirect as string | undefined;
  if (!redirectParam) return null;
  
  // Handle both absolute and relative URLs
  try {
    let url: URL;
    if (redirectParam.startsWith('http://') || redirectParam.startsWith('https://')) {
      url = new URL(redirectParam);
    } else {
      url = new URL(redirectParam, window.location.origin);
    }
    
    // Check if it's an invite URL and extract token
    if (url.pathname === '/invite' || url.pathname.includes('/invite')) {
      return url.searchParams.get('token');
    }
  } catch (error) {
    console.error('Error parsing redirect URL:', error);
  }
  
  return null;
};

// Fetch invitation email if coming from invite link
const fetchInvitationEmail = async () => {
  const token = getInvitationToken();
  if (!token) return;

  try {
    fetchingInvitation.value = true;
    const response = await $fetch<{
      success: boolean;
      invitation?: { email: string };
    }>(`/api/org/invite/${token}`);

    if (response.success && response.invitation?.email) {
      state.email = response.invitation.email;
      emailDisabled.value = true;
    }
  } catch (error) {
    console.error('Error fetching invitation:', error);
    // Don't show error, just allow manual entry
  } finally {
    fetchingInvitation.value = false;
  }
};

// Get redirect URL from query params or default to confirm page
const redirectUrl = computed(() => {
  const redirectParam = route.query.redirect as string | undefined;
  if (redirectParam) {
    return `${window.location.origin}${redirectParam}`;
  }
  return `${window.location.origin}/auth/confirm`;
});

onMounted(() => {
  fetchInvitationEmail();
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    loading.value = true;
    const { error } = await supabase.auth.signInWithOtp({
      email: event.data.email,
      options: {
        emailRedirectTo: redirectUrl.value,
        shouldCreateUser: false,
      },
    });
    if (error) {
      throw error;
    }
    toast.add({
      title: "Login link sent",
      description: "Check your email for the login link or OTP code.",
      color: "success",
    });
    router.push(
      "/auth/verify-email?email=" + encodeURIComponent(event.data.email)
    );
  } catch (error) {
    toast.add({
      title: "Error",
      description: "Failed to send login link. Please try again.",
      color: "error",
    });
    console.error("Error during sign-in:", error);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthPageShell
    title="Welcome back"
    description="Enter your credentials to access your account."
  >
    <UForm
      :schema="loginEmailSchema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UFormField class="w-full" label="Email" name="email">
        <UInput 
          v-model="state.email" 
          class="w-full" 
          size="lg" 
          :disabled="emailDisabled || fetchingInvitation"
          :loading="fetchingInvitation"
          :placeholder="fetchingInvitation ? 'Loading invitation...' : 'Your email'"
        />
        <template v-if="emailDisabled" #help>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            This email is required for the invitation you're accepting.
          </p>
        </template>
      </UFormField>

      <UButton :loading="loading" block type="submit" class="mt-2">
        Sign In
      </UButton>
    </UForm>

    <template #footer>
      <p>
        Don't have an account?
        <NuxtLink 
          :to="route.query.redirect ? `/auth/register?redirect=${encodeURIComponent(route.query.redirect as string)}` : '/auth/register'" 
          class="text-primary-500 hover:underline"
        >
          Create one
        </NuxtLink>
      </p>
    </template>
  </AuthPageShell>
</template>
