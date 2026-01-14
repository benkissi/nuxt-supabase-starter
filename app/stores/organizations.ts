/* eslint-disable @typescript-eslint/no-explicit-any */


export const useAuthStore = defineStore("organization", () => {
    const user = useSupabaseUser();
    const supabase = useSupabaseClient();

    const api = useApi();

    const organizations = ref<any>(null);
    const currentOrganization = ref<any>(null);
    const currentMember = ref<any>(null);

    const init = async () => {
        try {
            const data = await api.organizations.getOrganizations();
            organizations.value = data;
            currentOrganization.value = data[0];
            
            // Fetch current member for the current organization
            if (currentOrganization.value && user.value) {
                await fetchCurrentMember();
            }
            
            return data;
        } catch (error) {
            console.error("Error fetching organizations:", error);
            throw error;
        }
    }

    const fetchCurrentMember = async () => {
        if (!currentOrganization.value?.id || !user.value) {
            currentMember.value = null;
            return;
        }

        try {
            const userId = user.value.sub;
            const { data, error } = await supabase
                .from("organization_members")
                .select("*, account:accounts(id, name, image)")
                .eq("organization_id", currentOrganization.value.id)
                .eq("user_id", userId)
                .maybeSingle();

            if (error) {
                console.error("Error fetching current member:", error);
                currentMember.value = null;
                return;
            }

            currentMember.value = data;
        } catch (error) {
            console.error("Error fetching current member:", error);
            currentMember.value = null;
        }
    }

    // Watch for organization changes and refetch member
    watch(
        () => currentOrganization.value?.id,
        async (newOrgId) => {
            if (newOrgId && user.value) {
                await fetchCurrentMember();
            } else {
                currentMember.value = null;
            }
        }
    );

    return { user, organizations, currentOrganization, currentMember, init, fetchCurrentMember };
})

