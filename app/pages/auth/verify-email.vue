<script setup lang="ts">
import * as z from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const supabase = useSupabaseClient();
const route = useRoute();
const router = useRouter();
const toast = useToast();

const email = computed(() => (route.query.email as string) || "your email");

const schema = z.object({
  code: z
    .string()
    .min(6, "Enter the 6-digit code")
    .max(6, "Code must be 6 digits")
    .regex(/^[0-9]{6}$/, "Digits only"),
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  code: "",
});

const submitting = ref(false);
const resendCooldown = ref(30);
let interval: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  interval = setInterval(() => {
    if (resendCooldown.value > 0) resendCooldown.value -= 1;
  }, 1000);
});

onBeforeUnmount(() => {
  if (interval) clearInterval(interval);
});

function startResendCooldown() {
  resendCooldown.value = 30;
}

async function resend() {
  if (resendCooldown.value > 0) return;
  // TODO: call resend endpoint
  toast.add({
    title: "Code resent",
    description: "Check your inbox.",
    color: "info",
  });
  startResendCooldown();
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  submitting.value = true;
  try {
    // TODO: verify code via API
    const {
      data: { session },
      error,
    } = await supabase.auth.verifyOtp({
      email: email.value,
      token: event.data.code,
      type: "email",
    });
    if (error || !session) {
      throw error || new Error("No session returned");
    }
    console.log("verify email code payload", event.data);
    toast.add({
      title: "Email verified",
      description: "Your email has been confirmed.",
      color: "success",
    });
    router.push({ name: "auth-confirm" });
  } catch {
    toast.add({
      title: "Verification failed",
      description: "Invalid or expired code.",
      color: "error",
    });
    router.push("/auth/login");
  } finally {
    submitting.value = false;
  }
}

function onComplete(code: string) {
  state.code = code;
}
</script>

<template>
  <AuthPageShell
    title="Verify your email"
    :description="`We sent a 6-digit code to ${email}. Enter it below to continue.`"
  >
    <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
      <UFormField
        class="w-full"
        label="Verification Code"
        name="code"
        :help="'Enter the 6-digit code'"
      >
        <div class="w-full flex flex-col gap-3">
          <AuthOtpInput
            v-model="state.code"
            class="w-full"
            @complete="onComplete"
          />
          <!-- Hidden input to integrate with form validation -->
          <input v-model="state.code" type="hidden" name="code" />
        </div>
      </UFormField>

      <UButton
        block
        type="submit"
        :loading="submitting"
        :disabled="state.code?.length !== 6"
      >
        Verify Email
      </UButton>
    </UForm>

    <template #footer>
      <p class="mb-2">
        Didn't get a code?
        <button
          class="text-primary-500 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="resendCooldown > 0"
          @click="resend"
        >
          Resend<span v-if="resendCooldown > 0"> ({{ resendCooldown }})</span>
        </button>
      </p>
      <p>
        Wrong email?
        <NuxtLink to="/auth/register" class="text-primary-500 hover:underline"
          >Create a new account</NuxtLink
        >
      </p>
      <p class="mt-2">
        Already verified?
        <NuxtLink to="/auth/login" class="text-primary-500 hover:underline"
          >Sign in</NuxtLink
        >
      </p>
    </template>
  </AuthPageShell>
</template>
