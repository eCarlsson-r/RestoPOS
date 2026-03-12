export default defineNuxtRouteMiddleware((to) => {
    const { user, isAuthenticated } = useAuth()
    const userType = user.value?.type
    const checkNotAdmin = to.path.startsWith('/admin') && userType !== 'ADMIN'
    const checkNotKitchen = to.path.startsWith('/kitchen') && userType !== 'KITCHEN'
    const checkNotCashier = to.path.startsWith('/pos/cashier') && userType !== 'CASHIER'
    const checkWaiter = userType === 'WAITER'

    if (!isAuthenticated) return navigateTo('/')

    if (checkNotAdmin || checkNotKitchen || checkNotCashier) {
        if (checkWaiter) return navigateTo('/pos/floor-map')
        else return navigateTo('/')
    }
})
