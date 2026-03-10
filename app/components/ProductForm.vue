<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { Product, Category, ApiResponse } from '~/types/master'

const props = defineProps<{
    type: string
    item: Product | Partial<Product>
}>()

const emit = defineEmits(['save', 'close'])

const form = ref<Product>({ ...props.item } as Product)
const categories = ref<Category[]>([])

watch(() => props.item, (newVal) => {
    form.value = { ...newVal } as Product
}, { deep: true })

onMounted(async () => {
    if (props.type === 'product') {
        const data = await useApi<Category[] | ApiResponse<Category[]>>('/api/admin/master/category')
        if (Array.isArray(data)) {
            categories.value = data
        } else if (data && typeof data === 'object' && 'data' in data) {
            categories.value = (data as ApiResponse<Category[]>).data
        } else {
            categories.value = []
        }
    }
})

const submit = async () => {
    emit('save', form.value)
}
</script>

<template>
    <div class="h-full flex flex-col bg-white">
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-xl font-black uppercase italic tracking-tighter">
                {{ form.id ? 'Edit' : 'Tambah' }} {{ type }}
            </h2>
            <UButton
                variant="ghost"
                color="neutral"
                icon="i-lucide-x"
                @click="emit('close')"
            />
        </div>

        <form
            class="space-y-6 flex-1 overflow-y-auto pr-2"
            @submit.prevent="submit"
        >
            <div>
                <label class="label-master">Nama {{ type }}</label>
                <input
                    v-model="form.name"
                    class="input-master"
                    required
                >
            </div>

            <div v-if="type === 'product'">
                <label class="label-master">Kategori</label>
                <select
                    v-model="form.category_id"
                    class="input-master"
                >
                    <option
                        v-for="c in categories"
                        :key="c.id"
                        :value="c.id"
                    >
                        {{ c.name }}
                    </option>
                </select>
            </div>

            <div v-if="type === 'product' || type === 'prepare'">
                <label class="label-master">Resep / Komposisi</label>
                <UTextarea
                    v-model="form.recipe"
                    placeholder="Detail resep..."
                />
                <p class="text-[10px] text-neutral-400 mt-1">
                    Recipe Editor coming soon
                </p>
            </div>

            <UButton
                type="submit"
                size="xl"
                block
                label="Simpan Data"
                class="font-black uppercase italic"
            />
        </form>
    </div>
</template>

<style scoped>
@reference "tailwindcss";

.label-master {
    @apply block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest;
}

.input-master {
    @apply w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 ring-indigo-500 font-bold;
}
</style>
