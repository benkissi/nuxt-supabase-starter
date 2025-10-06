<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen py-8 px-4">
    <div class="w-full max-w-md space-y-6">
      <div class="text-center space-y-2">
        <h1 class="text-2xl font-semibold">{{ title }}</h1>
        <p v-if="description" class="text-sm text-gray-500 leading-relaxed">
          {{ description }}
        </p>
      </div>
      <UCard class="p-4">
        <slot />
      </UCard>
      <div class="text-center text-xs text-gray-400">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
