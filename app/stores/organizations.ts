/* eslint-disable @typescript-eslint/no-explicit-any */


export const useAuthStore = defineStore("organization", () => {
    const user = useSupabaseUser();

    const api = useApi();

    const organizations = ref<any>(null);
    const currentOrganization = ref<any>(null);

    const init = async () => {
        try {
            const data = await api.organizations.getOrganizations();
            organizations.value = data;
            currentOrganization.value = data[0];
            return data;
        } catch (error) {
            console.error("Error fetching organizations:", error);
            throw error;
        }
    }


    return { user, organizations, currentOrganization, init };
})

