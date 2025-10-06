<script setup lang="ts">
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';

const toast = useToast();
const route = useRoute();

// Expect a `token` (and optional email) coming from the password reset link (e.g. /auth/new-password?token=...&email=...)
const token = computed(() => route.query.token as string | undefined);
const email = computed(() => route.query.email as string | undefined);

const schema = z.object({
  password: z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  password: '',
  confirmPassword: '',
});

const submitting = ref(false);

async function onSubmit (event: FormSubmitEvent<Schema>) {
  if (!token.value) {
    toast.add({ title: 'Missing token', description: 'Reset token is missing or invalid.', color: 'error' });
    return;
  }
  submitting.value = true;
  try {
    // TODO: call API to set new password { token, password }
    console.log('set new password payload', { token: token.value, ...event.data });
    toast.add({ title: 'Password updated', description: 'You can now sign in with your new password.', color: 'success' });
    await navigateTo('/auth/login');
  } catch {
    toast.add({ title: 'Update failed', description: 'Could not update password. Try again.', color: 'error' });
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <AuthPageShell
    title="Set a new password"
    :description="email ? `Choose a strong password for ${email}.` : 'Choose a strong password.'"
  >
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField class="w-full" label="New Password" name="password">
        <UInput v-model="state.password" type="password" class="w-full" size="lg" />
      </UFormField>

      <UFormField class="w-full" label="Confirm Password" name="confirmPassword">
        <UInput v-model="state.confirmPassword" type="password" class="w-full" size="lg" />
      </UFormField>

  <input v-if="token" type="hidden" :value="token" name="token">

      <UButton block type="submit" :disabled="!state.password || state.password?.length < 8 || state.password !== state.confirmPassword" :loading="submitting"> Save Password </UButton>
    </UForm>

    <template #footer>
      <p>
        Remembered it?
        <NuxtLink to="/auth/login" class="text-primary-500 hover:underline">Sign in</NuxtLink>
      </p>
    </template>
  </AuthPageShell>
</template>
