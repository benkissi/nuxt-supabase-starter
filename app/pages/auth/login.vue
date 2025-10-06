<script setup lang="ts">
import type * as z from "zod";
import { loginEmailSchema } from "@/utils/schemas/forms/login.schema";
import type { FormSubmitEvent } from "@nuxt/ui";

const router = useRouter();
const toast = useToast();

type Schema = z.output<typeof loginEmailSchema>;

const state = reactive<Partial<Schema>>({
  email: undefined,
});
const supabase = useSupabaseClient();
const loading = ref(false);

const redirect = computed(() => `${window.location.origin}/auth/confirm`);

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    loading.value = true;
    const { error } = await supabase.auth.signInWithOtp({
      email: event.data.email,
      options: {
        emailRedirectTo: redirect.value,
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
        <UInput v-model="state.email" class="w-full" size="lg" />
      </UFormField>

      <UButton :loading="loading" block type="submit" class="mt-2">
        Sign In
      </UButton>
    </UForm>

    <template #footer>
      <p>
        Don't have an account?
        <NuxtLink to="/auth/register" class="text-primary-500 hover:underline"
          >Create one</NuxtLink
        >
      </p>
    </template>
  </AuthPageShell>
</template>
