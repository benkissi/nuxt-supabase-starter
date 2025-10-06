<script setup lang="ts">
type Invite = { email: string; role: "admin" | "member" };
const model = defineModel<Invite[]>("modelValue", { required: true });

const email = ref("");
const role = ref<"admin" | "member">("member");

function addInvite() {
  const e = email.value.trim();
  if (!e) return;
  model.value = [...model.value, { email: e, role: role.value }];
  email.value = "";
  role.value = "member";
}

function removeInvite(i: number) {
  model.value = model.value.filter((_, idx) => idx !== i);
}
</script>

<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
      <UFormField
        label="Email"
        name="invite_email"
        class="md:col-span-7 col-span-12 w-full"
      >
        <UInput v-model="email" placeholder="user@example.com" class="w-full" />
      </UFormField>
      <UFormField
        label="Role"
        name="invite_role"
        class="md:col-span-3 col-span-12 w-full"
      >
        <USelect
          v-model="role"
          :items="[
            { label: 'Admin', value: 'admin' },
            { label: 'Member', value: 'member' },
          ]"
          class="w-full"
        />
      </UFormField>
      <div class="md:col-span-2 col-span-12">
        <UButton color="primary" class="w-full" @click="addInvite">Add</UButton>
      </div>
    </div>

    <UCard v-if="model.length">
      <ul>
        <li
          v-for="(i, idx) in model"
          :key="idx"
          class="flex items-center justify-between py-2 border-b last:border-0"
        >
          <div>{{ i.email }}</div>
          <div class="flex items-center gap-3">
            <UBadge :color="i.role === 'admin' ? 'primary' : 'neutral'">{{
              i.role
            }}</UBadge>
            <UButton
              size="xs"
              variant="outline"
              color="neutral"
              @click="removeInvite(idx)"
              >Remove</UButton
            >
          </div>
        </li>
      </ul>
    </UCard>
  </div>
</template>
