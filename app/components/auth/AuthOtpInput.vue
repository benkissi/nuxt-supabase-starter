<script setup lang="ts">
const props = defineProps<{
  length?: number;
  autoFocus?: boolean;
}>();

// Switch to defineModel for two-way binding per project guidelines
const model = defineModel<string>({ default: "" });

const emit = defineEmits<{
  (e: "complete", value: string): void;
}>();

const length = props.length ?? 6;
const boxes = Array.from({ length });
const values = ref<string[]>(Array.from({ length }, () => ""));
const inputs = ref<HTMLInputElement[]>([] as unknown as HTMLInputElement[]);
type PossibleComponent = { $el?: unknown | null } | HTMLElement | null;
function setInputRef(component: PossibleComponent, index: number) {
  if (!component) return;
  const rootEl: unknown = (component as { $el?: unknown })?.$el ?? component;
  if (rootEl instanceof HTMLElement) {
    const el =
      rootEl.tagName === "INPUT"
        ? (rootEl as HTMLInputElement)
        : (rootEl.querySelector("input") as HTMLInputElement | null);
    if (el) inputs.value[index] = el;
  }
}

onMounted(() => {
  if (model.value) {
    const chars = model.value.split("").slice(0, length);
    chars.forEach((c, i) => (values.value[i] = c));
  }
  if (props.autoFocus !== false) {
    inputs.value[0]?.focus();
  }
});

watch(
  () => model.value,
  (val) => {
    if (!val) {
      values.value = Array.from({ length }, () => "");
      return;
    }
    if (val.length === length && val === values.value.join("")) return;
    const chars = val.split("").slice(0, length);
    values.value = Array.from({ length }, (_, i) => chars[i] || "");
  }
);

function updateFromValues() {
  const code = values.value.join("");
  if (model.value !== code) model.value = code;
  if (code.length === length && !code.includes("")) emit("complete", code);
}

function onInput(e: Event, index: number) {
  const target = e.target as HTMLInputElement;
  const val = target.value.replace(/\D/g, "");
  if (val.length > 1) {
    const chars = val.split("");
    chars.forEach((c, i) => {
      const pos = index + i;
      if (pos < length) values.value[pos] = c;
    });
    const nextIndex = Math.min(index + chars.length, length - 1);
    focusIndex(nextIndex);
  } else {
    values.value[index] = val;
    if (val && index < length - 1) focusIndex(index + 1);
  }
  updateFromValues();
}

function onKeyFilter(e: KeyboardEvent, index: number) {
  const key = e.key;
  const isDigit = /[0-9]/.test(key);
  if (key === "Backspace") {
    e.preventDefault();
    if (values.value[index]) {
      values.value[index] = "";
      updateFromValues();
      return;
    }
    if (index > 0) {
      focusIndex(index - 1);
      values.value[index - 1] = "";
      updateFromValues();
    }
    return;
  }
  if (key === "ArrowLeft") {
    e.preventDefault();
    if (index > 0) focusIndex(index - 1);
    return;
  }
  if (key === "ArrowRight") {
    e.preventDefault();
    if (index < length - 1) focusIndex(index + 1);
    return;
  }
  if (!isDigit && key.length === 1) {
    e.preventDefault();
  }
}

function onPaste(e: ClipboardEvent, index: number) {
  const data = e.clipboardData?.getData("text") || "";
  const digits = data.replace(/\D/g, "").slice(0, length);
  if (!digits) return;
  e.preventDefault();
  // Fill starting at current index
  for (let i = 0; i < digits.length; i++) {
    const pos = index + i;
    if (pos < length) {
      const char = digits.charAt(i);
      values.value[pos] = char;
    }
  }
  updateFromValues();
  const next = Math.min(index + digits.length, length - 1);
  focusIndex(next);
}

function focusIndex(i: number) {
  requestAnimationFrame(() => inputs.value[i]?.focus());
}
</script>

<template>
  <div
    class="flex w-full justify-between gap-2"
    :aria-label="`Enter ${length}-digit verification code`"
  >
    <UInput
      v-for="(_, i) in boxes"
      :key="i"
      :ref="(el: unknown) => setInputRef(el as PossibleComponent, i)"
      v-model="values[i]"
      inputmode="numeric"
      pattern="[0-9]*"
      maxlength="1"
      autocomplete="one-time-code"
      type="text"
      size="lg"
      :ui="{
        base: 'text-center flex-1',
        input: 'text-center tracking-wider font-medium',
      }"
      class="flex-1 text-center"
      @input="(e: Event) => onInput(e, i)"
      @keydown="onKeyFilter($event, i)"
      @paste="onPaste($event, i)"
    />
  </div>
</template>
