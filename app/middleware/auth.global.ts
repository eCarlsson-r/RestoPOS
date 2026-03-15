export default defineNuxtRouteMiddleware(async (to) => {
    const { user, checkAuth } = useAuth()

    await checkAuth()

    const userType = user.value?.type

    switch (userType) {
        case 'ADMIN':
            if (to.path.startsWith('/admin')) return
            else if (to.path === '/') return navigateTo('/admin/dashboard')
            break
        case 'KITCHEN':
            if (to.path.startsWith('/kitchen')) return
            else if (to.path === '/') return navigateTo('/kitchen')
            break
        case 'CASHIER':
            if (to.path.startsWith('/pos/cashier')) return
            else if (to.path === '/') return navigateTo('/pos/floor-map')
            break
        case 'WAITER':
            if (to.path === '/') return navigateTo('/pos/floor-map')
            break
        default:
            if (!user && to.path !== '/') return navigateTo('/')
            else return
    }
})
