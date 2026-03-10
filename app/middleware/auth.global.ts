export default defineNuxtRouteMiddleware((to) => {
    const { user, isAuthenticated } = useAuth()

    if (to.path === '/') return

    if (!isAuthenticated) return navigateTo('/')

    if (to.path.startsWith('/admin') && user.value?.role !== 'ADMIN') {
        return navigateTo('/pos/floor-map')
    }

    if (to.path.startsWith('/pos/cashier') && user.value?.role !== 'CASHIER' && user.value?.role !== 'ADMIN') {
        return navigateTo('/pos/floor-map')
    }
})
