<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const toast = useToast();

const schema = z.object({
  email: z.email("Invalid email"),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  email: undefined,
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  // TODO: call forgot-password endpoint
  console.log("forgot password payload", event.data);
  toast.add({
    title: "Email sent",
    description: "If that email exists, a reset link has been sent.",
    color: "success",
  });
}
</script>

<template>
  <AuthPageShell
    title="Reset your password"
    description="Enter the email associated with your account and we'll send you a reset link."
  >
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField class="w-full" label="Email" name="email">
        <UInput v-model="state.email" class="w-full" size="lg" />
      </UFormField>

      <UButton block type="submit"> Send reset link </UButton>
    </UForm>

    <template #footer>
      <p>
        Remember your password?
        <NuxtLink to="/auth/login" class="text-primary-500 hover:underline">Sign in</NuxtLink>
      </p>
      <p class="mt-2">
        Need an account?
        <NuxtLink to="/auth/register" class="text-primary-500 hover:underline">Create one</NuxtLink>
      </p>
    </template>
  </AuthPageShell>
</template>
