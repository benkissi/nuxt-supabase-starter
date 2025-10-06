// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  modules: [
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/test-utils",
    "@nuxt/ui",
    "@nuxtjs/supabase",
    "@pinia/nuxt",
  ],
  pages: {
    pattern: ["**/*.vue", "!**/partials/**"],
  },
  components: [
    "~/components",

    {
      path: "~/pages",
      pattern: "**/partials/**",
      pathPrefix: false,
    },
  ],
  runtimeConfig: {
    // supabaseRoleKey: process.env.NUXT_SUPABASE_ROLE_KEY,
    supabaseServiceKey: process.env.NUXT_SUPABASE_SERVICE_KEY,
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY,
      tunnels: "https://arrangements-namely-clone-emirates.trycloudflare.com",
    },
  },
  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    redirect: true,
    redirectOptions: {
      login: "/auth/login",
      callback: "/auth/confirm",
      exclude: [
        "/auth/register",
        "/auth/confirm",
        "/auth/verify-email",
        // "/auth/onboarding",
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});