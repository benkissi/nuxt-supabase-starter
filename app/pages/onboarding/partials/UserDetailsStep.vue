<script setup lang="ts">
const form = defineModel<{
  jobTitle?: string;
  avatarFile: File | null;
}>("modelValue", { required: true });
</script>

<template>
  <div class="space-y-4">
    <UFormField label="Job title" name="job_title" class="w-full">
      <UInput
        v-model="form.jobTitle"
        placeholder="e.g. Product Manager"
        class="w-full"
      />
    </UFormField>
    <UFormField label="Avatar" name="avatar" class="w-full">
      <UFileUpload v-model="form.avatarFile" accept="image/*" variant="area" />
    </UFormField>
  </div>
</template>
