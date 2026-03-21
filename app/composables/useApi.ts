import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack'

/**
 * Smart Hybrid API Composable
 * Supports both:
 * 1. const data = await useApi('/url') (Direct Call)
 * 2. const api = useApi(); const data = await api('/url') (Factory Pattern)
 */
export function useApi(): <T>(path: string, options?: NitroFetchOptions<NitroFetchRequest>) => Promise<T>
export function useApi<T>(path: string, options?: NitroFetchOptions<NitroFetchRequest>): Promise<T>
export function useApi<T>(pathOrOptions?: string | undefined, options: NitroFetchOptions<NitroFetchRequest> = {}) {
    const nuxtApp = useNuxtApp()

    const apiInstance = <R = T>(path: string, opts: NitroFetchOptions<NitroFetchRequest> = {}): Promise<R> => {
        // runWithContext is critical here to ensure inject() based composables
        // like useToast, useCookie, and useRuntimeConfig work inside async handlers.
        return nuxtApp.runWithContext(() => {
            const config = useRuntimeConfig()
            const token = useCookie('auth_token')

            return $fetch<R>(path, {
                baseURL: (config.public.apiBase as string) || 'http://localhost:8000/api/',
                ...opts,
                headers: {
                    Authorization: token.value ? `Bearer ${token.value}` : '',
                    Accept: 'application/json',
                    ...opts.headers
                },
                onResponse({ response }) {
                    const data = response._data
                    if (data?.err === 1) {
                        const msg = data.msg || 'Something went wrong'
                        nuxtApp.runWithContext(() => {
                            const toast = useToast()
                            toast.add({
                                title: 'Error',
                                description: msg,
                                color: 'error'
                            })
                        })
                        throw new Error(msg)
                    }
                },
                onResponseError({ response }) {
                    nuxtApp.runWithContext(() => {
                        const toast = useToast()
                        toast.add({
                            title: 'Request Failed',
                            description: `HTTP ${response.status}`,
                            color: 'error'
                        })
                    })
                }
            })
        })
    }

    // Direct call support (Legacy/Convenience)
    if (typeof pathOrOptions === 'string') {
        return apiInstance<T>(pathOrOptions, options)
    }

    // Factory mode (Best practice for new code)
    return apiInstance
}
