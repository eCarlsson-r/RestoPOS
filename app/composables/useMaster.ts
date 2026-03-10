import { useApi } from './useApi'
import type { ApiResponse } from '~/types/master'

export const useMaster = <T extends { id?: number }>(endpoint: string) => {
    const items = ref<T[]>([])
    const selectedItem = ref<T | null>(null)
    const isFormOpen = ref(false)

    const fetchItems = async () => {
        const data = await useApi<T[] | ApiResponse<T[]>>(`/api/admin/master/${endpoint}`)
        if (Array.isArray(data)) {
            items.value = data
        } else if (data && typeof data === 'object' && 'data' in data) {
            items.value = (data as ApiResponse<T[]>).data
        } else {
            items.value = []
        }
    }

    const saveItem = async (formData: T) => {
        const method = formData.id ? 'PUT' : 'POST'
        const url = formData.id ? `/api/admin/master/${endpoint}/${formData.id}` : `/api/admin/master/${endpoint}`
        await useApi(url, { method, body: formData })
        await fetchItems()
        isFormOpen.value = false
    }

    return { items, selectedItem, isFormOpen, fetchItems, saveItem }
}
