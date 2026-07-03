<script setup lang="ts">
const { t, locale, locales, setLocale } = useI18n()
const { user } = useAuth()

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
        <UHeader
            title=""
            :menu="{ title: t('header.title'), description: t('header.description') }"
        >
            <template #title>
                <NuxtLink to="/">
                    <AppLogo class="w-auto h-12 shrink-0" />
                </NuxtLink>
            </template>

            <ClientOnly>
                <TemplateMenu />
            </ClientOnly>

            <!-- Mobile slideover menu — its presence makes UHeader render the hamburger toggle -->
            <template #body>
                <ClientOnly>
                    <TemplateMenu orientation="vertical" />
                </ClientOnly>
            </template>

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

        <ClientOnly>
            <NotificationProvider />
            <ChatWidget v-if="user" />
        </ClientOnly>

        <UFooter>
            <template #default>
                <p class="text-sm text-muted">
                    Built with Nuxt UI by Carlsson Studio • © {{ new Date().getFullYear() }}
                </p>
            </template>
        </UFooter>
    </div>
</template>
