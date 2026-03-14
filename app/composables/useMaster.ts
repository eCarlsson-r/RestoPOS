import { useApi } from './useApi'
import type { ApiResponse } from '~/types/master'

export const useMaster = <T extends { id?: number }>(endpoint: string) => {
    const items = ref<T[]>([]) as Ref<T[]> // Force type
    const loading = ref(false)
    const selectedItem = ref<T | null>(null)
    const isFormOpen = ref(false)

    const fetchItems = async () => {
        loading.value = true
        try {
            const response = await useApi<T[] | ApiResponse<T[]>>(`/api/${endpoint}`)
            const result = (response && typeof response === 'object' && 'data' in response)
                ? (response as ApiResponse<T[]>).data
                : (response as T[])
            items.value = [...result] // Spread to trigger a new reference
        } finally {
            loading.value = false
        }
    }

    const saveItem = async (formData: T) => {
        const method = formData.id ? 'PUT' : 'POST'
        const url = formData.id ? `/api/${endpoint}/${formData.id}` : `/api/${endpoint}`
        await useApi(url, { method, body: formData })
        await fetchItems()
        isFormOpen.value = false
    }

    return { items, selectedItem, isFormOpen, fetchItems, saveItem }
}
