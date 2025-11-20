<template>
    <u-app>
        <u-header mode="slideover">
            <template #left>
                <u-user name="Nuxt Supabase template" to="/" :avatar="{ src: '/sample-logo.png' }"></u-user>
            </template>
            <template #right>
                <CommonColorMode></CommonColorMode>
            </template>
            <u-navigation-menu :items="navItems"></u-navigation-menu>
            <template #body>
                <u-navigation-menu :items="navItems"></u-navigation-menu>
            </template>
        </u-header>
        <u-main>
            <u-container>
                <slot/>
            </u-container>
        </u-main>
        <u-footer class="border-t border-t-default">
            <template #bottom>
                <u-container>
                    <u-footer-columns></u-footer-columns>
                </u-container>
            </template>
            <template #left>
                <div class="flex flex-col items-stretch gap-4">
                    <u-user name="Nuxt Supabase template" :avatar="{ src: '/sample-logo.png' }"></u-user>
                    <CommonCopyText class="h-8 text-nowrap" :content="appMeta.author.email"></CommonCopyText>
                </div>
            </template>
        </u-footer>
    </u-app>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from "@nuxt/ui";
import appMeta from "~/app.meta";

const navItems: NavigationMenuItem[] = [
    { label: "Repository", icon: "mdi:github", target: "_blank", to: "https://github.com/benkissi/nuxt-supabase-starter" },
];
</script>

<style></style>
