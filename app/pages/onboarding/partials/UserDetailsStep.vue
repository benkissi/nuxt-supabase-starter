<script setup lang="ts">
const form = defineModel<{
  jobTitle?: string;
  avatarFile: File | null;
  jobEmail?: string;
}>("modelValue", { required: true });
</script>

<template>
  <div class="space-y-4">
    <UFormField label="Job title" name="jobTitle" class="w-full">
      <UInput
        v-model="form.jobTitle"
        placeholder="e.g. Product Manager"
        class="w-full"
      />
    </UFormField>
    <UFormField label="Job email" name="jobEmail" class="w-full">
      <UInput
        v-model="form.jobEmail"
        placeholder="e.g. product.manager@example.com"
        class="w-full"
      />
    </UFormField>
    <UFormField label="Avatar" name="avatar" class="w-full">
      <UFileUpload v-model="form.avatarFile" accept="image/*" variant="area" />
    </UFormField>
  </div>
</template>
