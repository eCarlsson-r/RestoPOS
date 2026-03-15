<script setup lang="ts">
import type { KitchenRequestItem } from '~/types/master'

const form = ref({
    from_branch: '',
    from_storage: 'MAIN',
    to_storage: 'KTCN',
    items: [] as KitchenRequestItem[]
})

const currentItem = ref({ item_code: '', quantity: 1, item_type: 'INGR' })

const addItem = () => {
    if (!currentItem.value.item_code) return
    form.value.items.push({ ...currentItem.value })
    currentItem.value = { item_code: '', quantity: 1, item_type: 'INGR' } // Reset
}

const submitRequest = async () => {
    await useApi('/api/inventory/requests', {
        method: 'POST',
        body: form.value
    })
    emit('success')
}

const emit = defineEmits(['success'])
</script>

<template>
    <div class="p-8">
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-4xl font-black uppercase italic mb-8 tracking-tighter">
                Kitchen Request
            </h2>
            <UButton
                variant="ghost"
                color="neutral"
                icon="i-lucide-x"
                @click="emit('success')"
            />
        </div>

        <div class="grid grid-cols-2 gap-6 mb-10 p-6 bg-slate-50 rounded-4xl border border-slate-200">
            <UFormField label="Request From (Branch)">
                <USelect
                    v-model="form.from_branch"
                    :items="['Main Branch', 'City Center']"
                    class="w-full"
                />
            </UFormField>
            <UFormField label="Source Storage">
                <USelect
                    v-model="form.from_storage"
                    :items="['MAIN', 'KTCN', 'BART']"
                    class="w-full"
                />
            </UFormField>
        </div>

        <div class="flex items-end gap-3 mb-6 bg-slate-50 p-6 rounded-3xl border border-slate-200">
            <UFormField
                label="Item Type"
                class="w-32"
            >
                <USelect
                    v-model="currentItem.item_type"
                    :items="['INGR', 'UTLT']"
                />
            </UFormField>
            <UFormField
                label="Select Item"
                class="flex-1"
            >
                <USelectMenu
                    v-model="currentItem.item_code"
                    :items="['Chicken', 'Rice', 'Cooking Oil']"
                />
            </UFormField>
            <UFormField
                label="Qty"
                class="w-24"
            >
                <UInput
                    v-model="currentItem.quantity"
                    type="number"
                />
            </UFormField>
            <UButton
                icon="i-lucide-plus"
                @click="addItem"
            />
        </div>

        <UTable
            :data="form.items"
            :columns="[{ accessorKey: 'item_code', header: 'Item' }, { accessorKey: 'quantity', header: 'Quantity' }]"
        >
            <template #empty>
                <div class="py-10 text-center italic text-slate-400">
                    No items added yet.
                </div>
            </template>
        </UTable>

        <div class="mt-10 flex gap-4">
            <UButton
                size="xl"
                block
                class="flex-1 font-black italic"
                @click="submitRequest"
            >
                Send Request to Admin
            </UButton>
        </div>
    </div>
</template>
