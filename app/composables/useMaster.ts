import { useApi } from './useApi'
import type { ApiResponse } from '~/types/master'

export const useMaster = <T extends { id?: number }>(endpoint: string) => {
    const items = ref<T[]>([]) as Ref<T[]> // Force type
    const loading = ref(false)
    const selectedItem = ref<T | null>(null)
    const isFormOpen = ref(false)
    const api = useApi()

    const fetchItems = async (params: Record<string, string | number | boolean | null | undefined> = {}) => {
        loading.value = true
        try {
            const response = await api<T[] | ApiResponse<T[]>>(`${endpoint}`, { params })
            console.log(`[useMaster] Fetched ${endpoint}:`, response)

            const result = (response && typeof response === 'object' && 'data' in response)
                ? (response as ApiResponse<T[]>).data
                : (response as T[])

            items.value = Array.isArray(result) ? result : []
        } catch (e) {
            console.error(`[useMaster] Failed to fetch ${endpoint}:`, e)
            items.value = []
        } finally {
            loading.value = false
        }
    }

    const saveItem = async (formData: T | FormData) => {
        const method = 'POST'
        const url = `${endpoint}`
        await api(url, { method, body: formData })
        await fetchItems()
        isFormOpen.value = false
    }

    const deleteItem = async (formData: T) => {
        const method = 'DELETE'
        const url = `${endpoint}/${formData.id}`
        await api(url, { method })
        await fetchItems()
    }

    const deleteExistingImage = async (id: number) => {
        const method = 'DELETE'
        const url = `${endpoint}/image/${id}`
        await api(url, { method })
        await fetchItems()
    }

    return { items, selectedItem, isFormOpen, fetchItems, saveItem, deleteItem, deleteExistingImage }
}
