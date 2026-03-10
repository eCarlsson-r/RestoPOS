import type { User } from '~/types/master'

export const useAuth = () => {
    const user = useState<User | null>('user', () => null)
    const token = useCookie('auth_token', { maxAge: 60 * 60 * 12 }) // 12-hour shift
    const branch = useCookie('active_branch') // Crucial for multi-outlet support

    const login = async (credentials: { username: string, password: string }) => {
        const result = await $fetch<{ data: User[] }>('http://localhost:8000/api/login', {
            method: 'POST',
            body: credentials
        })

        const data = result.data
        if (!data || data.length === 0 || !data[0]) {
            throw new Error('Invalid login response')
        }

        const loggedInUser: User = data[0]

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

    return { user, login, logout, checkAuth, isAuthenticated: !!token.value }
}
