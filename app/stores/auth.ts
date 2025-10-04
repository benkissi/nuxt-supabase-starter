/* eslint-disable @typescript-eslint/no-explicit-any */


export const useAuthStore = defineStore("auth", () => {
    const user = ref<any>(null);
    const token = ref<string | null>(null);
    return { user, token };
})

