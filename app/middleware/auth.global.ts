export default defineNuxtRouteMiddleware(async (to) => {
    const { user, checkAuth } = useAuth()
    await checkAuth()

    // 1. If no user session and not on login page, redirect to login
    if (!user.value && to.path !== '/') {
        return navigateTo('/')
    }

    if (!user.value) return

    // Safe to use ?.toUpperCase() here
    const userType = user.value.type?.toUpperCase()
    // 2. Redirect from login page to dashboard if already logged in
    if (to.path === '/') {
        if (userType === 'ADMIN') return navigateTo('/admin/dashboard')
        if (userType === 'KITCHEN') return navigateTo('/kitchen')
        return navigateTo('/pos/floor-map')
    }

    // 3. Role-based restrictions
    if (userType === 'KITCHEN') {
        // Kitchen only allowed in /kitchen (and specifically its reports/mutations if needed)
        if (!to.path.startsWith('/kitchen') && !to.path.startsWith('/report')) {
            return navigateTo('/kitchen')
        }
    }

    if (userType === 'CASHIER' || userType === 'WAITER') {
        // Staff allowed in POS and specifically the Sales Report
        const allowedPaths = ['/pos/', '/report/sales', '/admin/sales']
        const isAllowed = allowedPaths.some(p => to.path.startsWith(p))

        if (!isAllowed) {
            return navigateTo('/pos/floor-map')
        }
    }

    // Admin and other unrestricted cases naturally proceed
})
