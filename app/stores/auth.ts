/* eslint-disable @typescript-eslint/no-explicit-any */


export const useAuthStore = defineStore("auth", () => {
    const user = useSupabaseUser();
    const token = ref<string | null>(null);


    return { user, token };
})

