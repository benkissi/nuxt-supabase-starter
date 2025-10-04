<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    path?: string;
    bucket?: string;
    alt?: string;
    class?: string;
  }>(),
  {
    path: "",
    bucket: "",
    alt: "",
    class: "",
  }
);

const { getPrivateImageUrl } = useSignedUrl();
const imageUrl = ref("");

watch(
  () => [props.path, props.bucket],
  async ([newPath, newBucket]) => {
    if (!newPath || !newBucket) {
      imageUrl.value = "";
    } else {
      try {
        imageUrl.value = await getPrivateImageUrl(newBucket, newPath);
      } catch (error) {
        console.error("Failed to get signed URL", error);
        imageUrl.value = ""; // Clear on error
      }
    }
  },
  { immediate: true }
);
</script>

<template>
  <div
    v-if="imageUrl"
    :class="props.class"
    :style="{
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }"
    role="img"
    :aria-label="props.alt"
  />
  <div
    v-else
    :class="['flex items-center justify-center bg-gray-200', props.class]"
  >
    <Icon name="line-md:loading-twotone-loop" class="w-6 h-6 text-gray-500" />
  </div>
</template>
