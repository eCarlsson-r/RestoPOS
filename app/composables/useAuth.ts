import type { User, AuthData } from '~/types/master'

export const useAuth = () => {
    const nuxtApp = useNuxtApp()
    // Capturing these within the Nuxt instance context
    const user = useState<User | null>('user', () => null)
    const token = useCookie('auth_token', { maxAge: 60 * 60 * 12 })
    const branch = ref(user.value?.employee?.branch_id)

    const login = async (credentials: { username: string, password: string }) => {
        return nuxtApp.runWithContext(async () => {
            const api = useApi()
            const result = await api<{ data: User[], token: string }>('login', {
                method: 'POST',
                body: credentials
            })

            if (!result.data || !result.data[0]) {
                throw new Error('Invalid login response')
            }

            // The API returns { user: {...}, employee: {...} } inside data[0]
            const loggedInUser: User = result.data[0]
            token.value = result.token
            user.value = loggedInUser

            if (loggedInUser && loggedInUser.employee) {
                branch.value = loggedInUser.employee.branch_id
            }

            return loggedInUser
        })
    }

    const logout = () => {
        token.value = null
        user.value = null
        navigateTo('/')
    }

    const checkAuth = async () => {
        if (token.value && !user.value) {
            try {
                return nuxtApp.runWithContext(async () => {
                    const api = useApi()
                    const response = await api<{ data: AuthData }>('user-profile')
                    user.value = response.data.user
                })
            } catch (e) {
                if (e) logout()
            }
        }
    }

    // Automatically log out if user becomes null but we still have a token
    watch(user, (newUser, oldUser) => {
        if (!newUser && oldUser && token.value) {
            logout()
        }
    })

    return { user, branch, login, logout, checkAuth, isAuthenticated: !!token.value }
}
