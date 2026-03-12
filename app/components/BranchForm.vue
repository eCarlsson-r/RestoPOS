<script setup lang="ts">
import type { Branch } from '~/types/master'

const props = defineProps<{
    item: Branch | null
}>()
const emit = defineEmits(['save', 'close'])

const form = ref({
    ...props.item
})
</script>

<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-xl font-black uppercase italic tracking-tighter">
                {{ form.id ? 'Edit' : 'Tambah' }} Cabang
            </h2>
            <UButton
                variant="ghost"
                color="neutral"
                icon="i-lucide-x"
                @click="emit('close')"
            />
        </div>

        <div class="space-y-4">
            <div class="grid grid-cols-4 gap-2">
                <div class="col-span-2">
                    <ULabel class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                        Nama Cabang
                    </ULabel>
                    <UInput
                        v-model="form.name"
                        class="w-full font-bold"
                    />
                </div>

                <div>
                    <ULabel class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                        Jumlah Lantai
                    </ULabel>
                    <UInput
                        v-model="form.floor_number"
                        class="w-full font-bold"
                    />
                </div>

                <div>
                    <ULabel class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                        Jumlah Meja / Lt
                    </ULabel>
                    <UInput
                        v-model="form.table_number"
                        class="w-full font-bold"
                    />
                </div>
            </div>

            <div>
                <ULabel class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                    Alamat Cabang
                </ULabel>
                <UTextarea
                    v-model="form.address"
                    class="w-full font-bold"
                />
            </div>

            <div class="grid grid-cols-4 gap-2">
                <div class="col-span-2">
                    <ULabel class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                        Nomor Telfon Cabang
                    </ULabel>
                    <UInput
                        v-model="form.phone"
                        class="w-full font-bold"
                    />
                </div>

                <div>
                    <ULabel class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                        Jumlah Dapur
                    </ULabel>
                    <UInput
                        v-model="form.kitchen_no"
                        class="w-full font-bold"
                    />
                </div>

                <div>
                    <ULabel class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                        Jumlah Bartndr
                    </ULabel>
                    <UInput
                        v-model="form.bartender_no"
                        class="w-full font-bold"
                    />
                </div>
            </div>
        </div>

        <div class="flex gap-2 mt-8">
            <UButton
                variant="outline"
                color="neutral"
                class="flex-1 font-bold justify-center"
                @click="emit('close')"
            >
                Batal
            </UButton>
            <UButton
                class="flex-1 font-black uppercase italic justify-center py-4"
                @click="emit('save', form)"
            >
                Simpan
            </UButton>
        </div>
    </div>
</template>
