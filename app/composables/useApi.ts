import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'
import type { FetchResponse } from 'ofetch'

export const useApi = <T>(path: string, options: NitroFetchOptions<NitroFetchRequest> = {}) => {
    const config = useRuntimeConfig()
    const token = useCookie('auth_token')

    return $fetch<T>(path, {
        baseURL: config.public.apiBase || 'http://localhost:8000',
        ...options,
        headers: {
            Authorization: token.value ? `Bearer ${token.value}` : '',
            Accept: 'application/json',
            ...options.headers
        },
        onResponseError({ response }: { response: FetchResponse<T> }): void {
            console.error('API Error:', response._data)
        }
    })
}
