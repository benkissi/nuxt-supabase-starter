<script setup lang="ts">
const user = useSupabaseUser();

const authStore =  useAuthStore()
const route = useRoute();
const redirect = route.query.redirect as string;


watch(user, (newUser) => {
  if (newUser) {
    authStore.user = newUser
    if (redirect) {
      navigateTo({ name: redirect });
      return;
    }
    navigateTo("/dashboard");
  }
}, {
    immediate: true,
});
</script>

<template>
  <section class="h-screen flex w-full items-center justify-center">
    <p class="text-xl">Waiting for login...</p>
  </section>
</template>
