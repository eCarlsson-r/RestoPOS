export default defineNuxtRouteMiddleware((to) => {
    const { user, isAuthenticated } = useAuth()

    if (to.path === '/') return

    if (!isAuthenticated) return navigateTo('/')

    if (to.path.startsWith('/admin') && user.value?.type !== 'ADMIN') {
        return navigateTo('/pos/floor-map')
    }

    if (to.path.startsWith('/kitchen') && user.value?.type !== 'KITCHEN' && user.value?.type !== 'ADMIN') {
        return navigateTo('/pos/floor-map')
    }

    if (to.path.startsWith('/pos/cashier') && user.value?.type !== 'CASHIER' && user.value?.type !== 'ADMIN') {
        return navigateTo('/pos/floor-map')
    }
})
