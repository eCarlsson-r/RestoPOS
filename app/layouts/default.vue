<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

const languageItems = computed(() =>
    locales.value.map(l => ({
        label: l.name ?? l.code,
        checked: l.code === locale.value,
        type: 'checkbox' as const,
        onSelect: () => setLocale(l.code)
    }))
)
</script>

<template>
    <div>
        <UHeader title="">
            <template #title>
                <NuxtLink to="/">
                    <AppLogo class="w-auto h-12 shrink-0" />
                </NuxtLink>
            </template>

            <ClientOnly>
                <TemplateMenu />
                <NotificationProvider />
            </ClientOnly>

            <template #right>
                <UDropdownMenu :items="languageItems">
                    <UButton
                        icon="i-lucide-languages"
                        color="neutral"
                        variant="ghost"
                        :label="locale.toUpperCase()"
                    />
                </UDropdownMenu>

                <UColorModeButton />

                <UButton
                    icon="i-lucide-log-out"
                    color="neutral"
                    variant="ghost"
                    @click="useAuth().logout()"
                />
            </template>
        </UHeader>

        <UMain>
            <slot />
        </UMain>

        <UFooter>
            <template #default>
                <p class="text-sm text-muted">
                    Built with Nuxt UI by Carlsson Studio • © {{ new Date().getFullYear() }}
                </p>
            </template>
        </UFooter>
    </div>
</template>
