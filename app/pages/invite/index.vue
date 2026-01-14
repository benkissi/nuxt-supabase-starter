<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const toast = useToast();

interface Invitation {
  id: string;
  organization_id: string;
  name?: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
}

interface Organization {
  id: string;
  name: string;
  description?: string;
  image?: { path?: string; bucket?: string };
}

interface InvitationLookupResponse {
  success: boolean;
  message?: string;
  error?: string;
  invitation?: Invitation;
  organization?: Organization;
}

interface AcceptInvitationResponse {
  success: boolean;
  message?: string;
  alreadyMember?: boolean;
  organizationId?: string;
}

const token = computed(() => route.query.token as string);
const loading = ref(true);
const accepting = ref(false);
const invitation = ref<Invitation | null>(null);
const organization = ref<Organization | null>(null);
const error = ref<string | null>(null);

// Fetch invitation details
const fetchInvitation = async () => {
  if (!token.value) {
    error.value = 'Invalid invitation link';
    loading.value = false;
    return;
  }

  try {
    // Fetch invitation details from server route (bypasses RLS)
    const response = await $fetch<InvitationLookupResponse>(`/api/org/invite/${token.value}`);

    if (!response.success) {
      error.value = response.message || 'Invitation not valid';
      loading.value = false;
      return;
    }

    invitation.value = response.invitation || null;
    organization.value = response.organization || null;
  } catch (err: unknown) {
    console.error('Error fetching invitation:', err);
    
    // Handle different error types
    if (err && typeof err === 'object' && 'statusCode' in err) {
      const statusCode = (err as { statusCode: number }).statusCode;
      if (statusCode === 404) {
        error.value = 'Invitation not found or has been revoked';
      } else {
        error.value = 'Failed to load invitation details';
      }
    } else {
      error.value = 'Failed to load invitation details';
    }
  } finally {
    loading.value = false;
  }
};

// Accept invitation
const acceptInvitation = async () => {
  if (!user.value || !invitation.value) {
    // Redirect to login with return URL
    const returnUrl = `/invite?token=${token.value}`;
    router.push(`/auth/login?redirect=${encodeURIComponent(returnUrl)}`);
    return;
  }

  try {
    accepting.value = true;

    // Call server route to accept invitation
    const response = await $fetch<AcceptInvitationResponse>('/api/org/invite/accept', {
      method: 'POST',
      body: {
        invitationId: invitation.value.id,
        token: token.value,
      },
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to accept invitation');
    }

    // Show success message and redirect
    toast.add({
      title: 'Success!',
      description: `You've joined ${organization.value?.name || 'the organization'}`,
      color: 'success',
    });

    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  } catch (err: unknown) {
    console.error('Error accepting invitation:', err);
    
    // Extract error message from $fetch error structure
    let errorMessage = 'Failed to accept invitation';
    if (err && typeof err === 'object') {
      const errorObj = err as any;
      if (errorObj.data?.message) {
        errorMessage = errorObj.data.message;
      } else if (errorObj.message) {
        errorMessage = errorObj.message;
      } else if (errorObj.statusMessage) {
        errorMessage = errorObj.statusMessage;
      }
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    
    error.value = errorMessage;
    toast.add({
      title: 'Error',
      description: errorMessage,
      color: 'error',
    });
  } finally {
    accepting.value = false;
  }
};

onMounted(() => {
  fetchInvitation();
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
    <UCard class="w-full max-w-md">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-12">
        <UIcon name="i-lucide-loader-2" class="w-12 h-12 animate-spin text-primary-500 mb-4" />
        <p class="text-gray-600 dark:text-gray-400">Loading invitation...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-8">
        <UIcon name="i-lucide-x-circle" class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 class="text-2xl font-semibold mb-2">
          {{ error.includes('email') ? 'Email Mismatch' : 'Invalid Invitation' }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">{{ error }}</p>
        <div class="space-y-2">
          <UButton
            v-if="error.includes('email') && user"
            label="Sign Out and Use Correct Email"
            color="primary"
            block
            @click="async () => {
              await supabase.auth.signOut();
              router.push(`/auth/login?redirect=${encodeURIComponent($route.fullPath)}`);
            }"
          />
          <UButton
            label="Go to Dashboard"
            color="neutral"
            variant="outline"
            block
            @click="router.push('/dashboard')"
          />
        </div>
      </div>

      <!-- Invitation Details -->
      <div v-else-if="invitation && organization" class="text-center py-8">
        <!-- Organization Logo/Image -->
        <div class="mb-6">
          <div class="w-20 h-20 mx-auto rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
            <UIcon name="i-lucide-building-2" class="w-10 h-10 text-primary-600 dark:text-primary-400" />
          </div>
        </div>

        <!-- Header -->
        <div class="mb-6">
          <h1 class="text-3xl font-bold mb-2">You're Invited!</h1>
          <p class="text-gray-600 dark:text-gray-400">
            Join <strong class="text-gray-900 dark:text-gray-100">{{ organization.name }}</strong> as a
            <UBadge :label="invitation.role" color="primary" class="capitalize ml-1" />
          </p>
        </div>

        <!-- Organization Description -->
        <div v-if="organization.description" class="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ organization.description }}</p>
        </div>

        <!-- Invitation Details -->
        <div class="mb-8 text-sm space-y-2">
          <!-- Email -->
          <div 
            v-if="invitation.email" 
            class="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400"
          >
            <UIcon name="i-lucide-mail" class="w-4 h-4" />
            <span>{{ invitation.email }}</span>
          </div>
          
          <!-- Expiration -->
          <div class="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
            <UIcon name="i-lucide-clock" class="w-4 h-4" />
            <span>Expires {{ new Date(invitation.expires_at).toLocaleDateString() }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div v-if="!user" class="space-y-3">
          <UButton
            label="Sign In to Accept"
            size="lg"
            block
            @click="acceptInvitation"
          />
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?
            <NuxtLink
              :to="`/auth/register?redirect=${encodeURIComponent($route.fullPath)}`"
              class="text-primary-500 hover:underline"
            >
              Sign up
            </NuxtLink>
          </p>
        </div>

        <div v-else class="space-y-3">
          <!-- Email Mismatch Warning -->
          <div 
            v-if="user.email !== invitation.email" 
            class="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-4"
          >
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div class="text-left flex-1">
                <p class="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Email Mismatch
                </p>
                <p class="text-xs text-yellow-700 dark:text-yellow-300">
                  This invitation was sent to <strong>{{ invitation.email }}</strong>, but you're logged in as <strong>{{ user.email }}</strong>. Please sign out and sign in with the correct email.
                </p>
              </div>
            </div>
          </div>
          
          <UButton
            label="Accept Invitation"
            size="lg"
            block
            :loading="accepting"
            :disabled="user.email !== invitation.email"
            @click="acceptInvitation"
          />
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Logged in as {{ user.email }}
          </p>
          <p v-if="user.email !== invitation.email" class="text-xs text-gray-500 dark:text-gray-500">
            <button
              class="text-primary-500 hover:underline"
              @click="async () => {
                await supabase.auth.signOut();
                router.push(`/auth/login?redirect=${encodeURIComponent($route.fullPath)}`);
              }"
            >
              Sign out and use {{ invitation.email }}
            </button>
          </p>
        </div>
      </div>
    </UCard>
  </div>
</template>
