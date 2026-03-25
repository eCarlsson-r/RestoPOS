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
