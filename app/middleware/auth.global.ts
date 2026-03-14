export default defineNuxtRouteMiddleware((to) => {
    const { user, isAuthenticated } = useAuth()

    const userType = user.value?.type

    switch (userType) {
        case 'ADMIN':
            if (to.path.startsWith('/admin')) return
            else if (to.path === '/') return navigateTo('/admin/dashboard')
            break
        case 'KITCHEN':
            if (to.path.startsWith('/kitchen')) return
            else if (to.path === '/') return navigateTo('/kitchen/dashboard')
            break
        case 'CASHIER':
            if (to.path.startsWith('/pos/cashier')) return
            else if (to.path === '/') return navigateTo('/pos/floor-map')
            break
        case 'WAITER':
            if (to.path === '/') return navigateTo('/pos/floor-map')
            break
        default:
            if (!isAuthenticated && to.path !== '/') return navigateTo('/')
            else return
    }
})
