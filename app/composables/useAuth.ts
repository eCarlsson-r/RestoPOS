import type { User } from '~/types/master'

export const useAuth = () => {
    const config = useRuntimeConfig()
    const user = useState<User | null>('user', () => null)
    const token = useCookie('auth_token', { maxAge: 60 * 60 * 12 }) // 12-hour shift
    const branch = useCookie('active_branch') // Crucial for multi-outlet support

    const login = async (credentials: { username: string, password: string }) => {
        const url = config.public.apiBase || 'http://localhost:8000/'
        const result = await $fetch<{ data: User[] }>(url + 'api/login', {
            method: 'POST',
            body: credentials
        })

        const data = result.data
        if (!data || data.length === 0 || !data[0]) {
            throw new Error('Invalid login response')
        }

        const loggedInUser: User = data[0]

        // Set token (placeholder for now as backend doesn't return one yet)
        token.value = 'dummy-token'

        user.value = loggedInUser
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
                const response = await useApi<{ data: User }>('/api/user-profile')
                user.value = response.data
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
