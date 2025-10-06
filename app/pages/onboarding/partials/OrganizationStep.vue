<script setup lang="ts">
// Organization creation fields

const form = defineModel<{
  name: string;
  description?: string;
  logoFile: File | null;
  slug?: string;
}>("modelValue", { required: true });
// The onLogo function has been removed as it is now unused.

watch(
  () => form.value.name,
  (newName) => {
   
      form.value.slug = newName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 50);

  },
  { immediate: true }
);
</script>

<template>
  <div class="space-y-4">
    <UFormField label="Organization logo" name="org_logo" class="w-full">
      <UFileUpload v-model="form.logoFile" accept="image/*" variant="area" />
    </UFormField>
    <UFormField
      label="Organization name"
      name="org_name"
      required
      class="w-full"
    >
      <UInput v-model="form.name" placeholder="Your company" class="w-full" />
    </UFormField>
    <UFormField label="Description" name="org_desc" class="w-full">
      <UTextarea
        v-model="form.description"
        placeholder="What does your organization do?"
        class="w-full"
      />
    </UFormField>
     <UFormField
      label="Organization slug"
      name="org_name"
      required
      class="w-full"
    >
      <UInput :value="form.slug" disabled placeholder="Your company" class="w-full" />
    </UFormField>
  </div>
</template>
