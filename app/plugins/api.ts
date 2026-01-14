export default defineNuxtPlugin({
  setup() {
    const authCookie = useCookie<Record<string, string>>("auth");
    const token = authCookie.value?.token;
    const config = useRuntimeConfig();
    const api = $fetch.create({
      baseURL: (config.public.apiBase as string) || undefined,
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
