import type { User, AuthData } from '~/types/master'

export const useAuth = () => {
    const config = useRuntimeConfig()
    const user = useState<User | null>('user', () => null)
    const token = useCookie('auth_token', { maxAge: 60 * 60 * 12 }) // 12-hour shift
    const branch = ref(user.value?.employee?.branch_id)

    const login = async (credentials: { username: string, password: string }) => {
        const url = config.public.apiBase || 'http://localhost:8000/'
        const result = await $fetch<{ data: AuthData[], token: string }>(url + 'api/login', {
            method: 'POST',
            body: credentials
        })

        if (!result.data || !result.data[0]) {
            throw new Error('Invalid login response')
        }

        // The API returns { user: {...}, employee: {...} } inside data[0]
        const data = result.data[0]
        const loggedInUser: User = data.user
        token.value = result.token
        user.value = loggedInUser
        console.info(loggedInUser)

        if (loggedInUser.employee?.branch_id) {
            branch.value = loggedInUser.employee.branch_id
        }

        return loggedInUser
    }

    const logout = () => {
        token.value = null
        user.value = null
        navigateTo('/')
    }

    const checkAuth = async () => {
        if (token.value && !user.value) {
            try {
                // Adjusting to extract the nested 'user' object
                const response = await useApi<{ data: AuthData }>('/api/user-profile')
                user.value = response.data.user
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
