<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const toast = useToast();
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

const redirect = computed(
  () => `${window.location.origin}/auth/confirm?redirect=onboarding`
);

async function onSubmit(event: FormSubmitEvent<Schema>) {
  console.log("submit", event);
  try {
    loading.value = true;
    // Simulate an API call
    const { error } = await supabase.auth.signInWithOtp({
      email: event.data.email || "",
      options: {
        emailRedirectTo: redirect.value,
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
    toast.add({
      title: "Error",
      description:
        error?.message || "Failed to create account. Please try again.",
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
        <UInput v-model="state.email" class="w-full" size="lg" placeholder="Your email"/>
      </UFormField>

      <UButton :loading="loading" type="submit" block class="mt-2">
        Sign Up
      </UButton>
    </UForm>

    <template #footer>
      <p>
        Already have an account?
        <NuxtLink to="/auth/login" class="text-primary-500 hover:underline"
          >Sign in</NuxtLink
        >
      </p>
    </template>
  </AuthPageShell>
</template>
