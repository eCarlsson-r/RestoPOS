import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'
import type { FetchResponse } from 'ofetch'

export const useApi = <T>(path: string, options: NitroFetchOptions<NitroFetchRequest> = {}) => {
    const config = useRuntimeConfig()
    const token = useCookie('auth_token')
    const toast = useToast()

    return $fetch<T>(path, {
        baseURL: config.public.apiBase || 'http://localhost:8000',
        ...options,
        headers: {
            Authorization: token.value ? `Bearer ${token.value}` : '',
            Accept: 'application/json',
            ...options.headers
        },
        onResponse({ response }: { response: FetchResponse<T> }): void {
            const data = response._data as Record<string, unknown> | undefined
            if (data?.err === 1) {
                const msg = (data.msg as string) || 'Something went wrong'
                toast.add({
                    title: 'Error',
                    description: msg,
                    color: 'error'
                })
                throw new Error(msg)
            }
        },
        onResponseError({ response }: { response: FetchResponse<T> }): void {
            console.error('API Error:', response._data)
            toast.add({
                title: 'Request Failed',
                description: `HTTP ${response.status}`,
                color: 'error'
            })
        }
    })
}
