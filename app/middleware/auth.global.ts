export default defineNuxtRouteMiddleware((to) => {
    const { user, isAuthenticated } = useAuth()

    if (to.path === '/') return
    if (!isAuthenticated) return navigateTo('/')

    const userType = user.value?.type

    // 1. Admin Guard: Only ADMIN can enter /admin
    if (to.path.startsWith('/admin') && userType !== 'ADMIN') {
        return navigateTo('/pos/floor-map')
    }

    // 2. Kitchen Guard: Only KITCHEN (and maybe Admin) can enter /kitchen
    if (to.path.startsWith('/kitchen') && userType !== 'KITCHEN' && userType !== 'ADMIN') {
        return navigateTo('/pos/floor-map')
    }

    // 3. Cashier Guard: Only CASHIER (and maybe Admin) can enter /pos/cashier
    if (to.path.startsWith('/pos/cashier') && userType !== 'CASHIER' && userType !== 'ADMIN') {
        return navigateTo('/pos/floor-map')
    }
})
