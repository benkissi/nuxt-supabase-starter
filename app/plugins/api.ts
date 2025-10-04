export default defineNuxtPlugin({
  setup() {
    const authCookie = useCookie<Record<string, string>>("auth");
    const token = authCookie.value?.token;
    const api = $fetch.create({
      baseURL: useRuntimeConfig().public.apiBase as string,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    return {
      provide: {
        api
      }
    }
  }
});
