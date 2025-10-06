<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import OrganizationStep from "./partials/OrganizationStep.vue";
import UserDetailsStep from "./partials/UserDetailsStep.vue";
import InviteMembersStep from "./partials/InviteMembersStep.vue";

const supabase = useSupabaseClient();
const { data: { user } } = await supabase.auth.getUser()
const auth = useAuthStore();
const router = useRouter();
const toast = useToast();

const step = ref(0);
const steps = [
  { label: "Create organization" },
  { label: "Update your details" },
  { label: "Invite members" },
];
console.log('auth org----', user)
// Aggregate form models
const org = ref<{ name: string; description?: string; logoFile: File | null, slug: string}>({
  name: "",
  description: "",
  logoFile: null,
  slug: "",
});
const userDetails = ref<{
  fullName: string;
  jobTitle?: string;
  avatarFile: File | null;
}>({ fullName: "", jobTitle: "", avatarFile: null });
type Invite = { email: string; role: "admin" | "member" };
const invites = ref<Invite[]>([]);

const submitting = ref(false);
const errorMsg = ref<string | null>(null);

async function submitAll() {
  submitting.value = true;
  errorMsg.value = null;

  try {
    const userId = user?.id;
    if (!userId) throw new Error("Not authenticated");

    // 1️⃣ Create organization
    let organizationId = auth.organization?.id;
    if (!organizationId) {
      const { data: orgInsert, error: orgErr } = await (supabase as any)
        .from("organizations")
        .insert({
          name: org.value.name,
          description: org.value.description,
          owner_id: userId,
          image: null, // we'll upload after creation
          slug: org.value.slug,
        })
        .select("id")
        .single();
      if (orgErr) throw orgErr;
      organizationId = orgInsert.id;
    }

    // 2️⃣ Wait for org membership (organization_members)
    async function waitForMember(
      orgId: string,
      retries = 10,
      delayMs = 200
    ): Promise<{ id: string } | null> {
      for (let i = 0; i < retries; i++) {
        const { data } = await supabase
          .from("organization_members")
          .select("id")
          .eq("organization_id", orgId)
          .eq("user_id", userId as string)
          .maybeSingle();
        if (data) return data as { id: string };
        await new Promise((r) => setTimeout(r, delayMs));
      }
      return null;
    }

    const member = await waitForMember(organizationId);
    if (member && (userDetails.value.fullName || userDetails.value.jobTitle)) {
      await ( supabase as any)
        .from("organization_members")
        .update({
          job_title: userDetails.value.jobTitle,
        })
        .eq("id", member.id);
    }

    // 3️⃣ Upload user avatar (optional)
    if (userDetails.value.avatarFile) {
      const file = userDetails.value.avatarFile;
      const safeName = `${crypto.randomUUID()}_${file.name.replace(/\s+/g, "_")}`;
      const filePath = `${userId}/${safeName}`;

      const { error: upErr } = await supabase.storage
        .from("user-images")
        .upload(filePath, file, { upsert: true });
      if (upErr) throw upErr;

      const image = { bucket: "user-images", path: filePath };
      const { error: accErr } = await ( supabase as any)
        .from("accounts")
        .update({ image })
        .eq("user_id", userId);
      if (accErr) throw accErr;
    }

    // 4️⃣ Upload organization logo
    if (org.value.logoFile && organizationId) {
      const file = org.value.logoFile;
      const safeName = `${crypto.randomUUID()}_${file.name.replace(/\s+/g, "_")}`;
      const filePath = `${organizationId}/${safeName}`;

      const { error: logoErr } = await supabase.storage
        .from("organization-images")
        .upload(filePath, file, { upsert: true });
      if (logoErr) throw logoErr;

      const image = { bucket: "organization-images", path: filePath };
      const { error: orgUpdErr, data: updatedOrg } = await (supabase as any)
        .from("organizations")
        .update({ image })
        .eq("id", organizationId)
        .select()
        .single();
      if (orgUpdErr) throw orgUpdErr;
      auth.organization = updatedOrg || auth.organization;
    }

    // 5️⃣ Create invitations
    if (invites.value.length) {
      const formatted = invites.value.map((i) => ({
        organization_id: organizationId,
        email: i.email,
        role: i.role,
        invited_by: userId,
      }));
      const { error: inviteErr } = await (supabase as any)
        .from("invitations")
        .insert(formatted);
      if (inviteErr) throw inviteErr;
    }

    // ✅ Done
    toast.add({ title: "Onboarding completed successfully" });
    router.push("/dashboard");
  } catch (err: any) {
    console.error(err);
    errorMsg.value = err.message || "Failed to complete onboarding";
  } finally {
    submitting.value = false;
  }
}

function next() {
  if (step.value < steps.length - 1) step.value++;
}
function back() {
  if (step.value > 0) step.value--;
}
</script>


<template>
  <div class="w-full h-screen flex items-center justify-center">
    <div class="p-6 max-w-4xl w-full">
      <div class="text-center mb-4">
        <h1 class="text-2xl font-semibold">Get set up</h1>
        <p class="text-neutral-500 mt-1">
          Complete these quick steps to finish onboarding.
        </p>
      </div>
      <UStepper v-model="step" :items="steps" />

      <UCard class="mt-6">
        <template #header>
          <div class="font-semibold">
            {{ (steps[step] || { label: "" }).label }}
          </div>
        </template>

        <div>
          <OrganizationStep v-if="step === 0" v-model:model-value="org" />
          <UserDetailsStep
            v-else-if="step === 1"
            v-model:model-value="userDetails"
          />
          <InviteMembersStep v-else v-model:model-value="invites" />
        </div>

        <template #footer>
          <div class="flex items-center justify-end gap-2">
            <UButton
              v-if="step > 0"
              variant="outline"
              color="neutral"
              @click="back"
              >Back</UButton
            >
            <UButton
              v-if="step < steps.length - 1"
              color="primary"
              @click="next"
              >Next</UButton
            >
            <UButton
              v-else
              color="primary"
              :loading="submitting"
              @click="submitAll"
              >Finish</UButton
            >
          </div>
          <div v-if="errorMsg" class="text-red-600 text-sm mt-2">
            {{ errorMsg }}
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>
