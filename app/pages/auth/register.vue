<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const toast = useToast();
const route = useRoute();
const supabase = useSupabaseClient();

const schema = z.object({
  email: z.email("Invalid email"),
  fullName: z.string().min(2, "Name is too short").max(100, "Name is too long"),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  fullName: undefined,
  email: undefined,
});
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
      invitation?: { email: string; name?: string };
    }>(`/api/org/invite/${token}`);

    if (response.success && response.invitation?.email) {
      state.email = response.invitation.email;
      // Prefill name if available from invitation
      if (response.invitation.name) {
        state.fullName = response.invitation.name;
      }
      emailDisabled.value = true;
    }
  } catch (error) {
    console.error('Error fetching invitation:', error);
    // Don't show error, just allow manual entry
  } finally {
    fetchingInvitation.value = false;
  }
};

// Get redirect URL from query params or default to onboarding
const redirectUrl = computed(() => {
  const redirectParam = route.query.redirect as string | undefined;
  if (redirectParam) {
    return `${window.location.origin}${redirectParam}`;
  }
  return `${window.location.origin}/auth/confirm?redirect=onboarding`;
});

onMounted(() => {
  fetchInvitationEmail();
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  console.log("submit", event);
  try {
    loading.value = true;
    // Simulate an API call
    const { error } = await supabase.auth.signInWithOtp({
      email: event.data.email || "",
      options: {
        emailRedirectTo: redirectUrl.value,
        shouldCreateUser: true,
        data: {
          full_name: event.data.fullName,
        },
      },
    });
    if (error) throw error;
    toast.add({
      title: "Check your email",
      description: `A confirmation link has been sent to ${event.data.email}. Please check your inbox and spam folder.`,
      color: "success",
    });
  } catch (error) {
    const errorMessage =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message: string }).message
        : "Failed to create account. Please try again.";
    toast.add({
      title: "Error",
      description: errorMessage,
      color: "error",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthPageShell
    title="Create your account"
    description="Sign up to get started. You will receive a confirmation link via email."
  >
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField class="w-full" label="Name" name="fullName"  required>
        <UInput v-model="state.fullName" class="w-full" size="lg" placeholder="Your full name"/>
      </UFormField>

      <UFormField class="w-full" label="Email" name="email"  required>
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

      <UButton :loading="loading" type="submit" block class="mt-2">
        Sign Up
      </UButton>
    </UForm>

    <template #footer>
      <p>
        Already have an account?
        <NuxtLink 
          :to="route.query.redirect ? `/auth/login?redirect=${encodeURIComponent(route.query.redirect as string)}` : '/auth/login'" 
          class="text-primary-500 hover:underline"
        >
          Sign in
        </NuxtLink>
      </p>
    </template>
  </AuthPageShell>
</template>
