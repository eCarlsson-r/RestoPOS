<script setup>
const props = defineProps(['sourceTable'])
const emit = defineEmits(['close', 'moved'])
const { tables } = useTables() // List of all tables

const destinationTable = ref(null)

const confirmMove = async () => {
    if (!destinationTable.value) return

    await useApi('/api/tables/move', {
        method: 'POST',
        body: {
            old_table: props.sourceTable,
            new_table: destinationTable.value
        }
    })
    emit('moved')
}
</script>

<template>
    <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-100 p-6">
        <div class="bg-white w-full max-w-4xl rounded-[3rem] p-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <header class="flex justify-between items-center mb-8">
                <h2 class="text-3xl font-black uppercase italic tracking-tighter">
                    Pindah Meja: {{ sourceTable }} → {{ destinationTable || '?' }}
                </h2>
                <button
                    class="text-slate-400"
                    @click="$emit('close')"
                >
                    Tutup
                </button>
            </header>

            <div class="grid grid-cols-5 gap-4 overflow-y-auto flex-1 p-2">
                <button
                    v-for="t in tables.filter(x => x.number !== sourceTable)"
                    :key="t.id"
                    :disabled="t.status !== 'available'"
                    :class="[
                        'h-24 rounded-3xl font-black text-xl transition-all',
                        destinationTable === t.number ? 'bg-black text-white ring-8 ring-black/10'
                        : t.status === 'available' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    ]"
                    @click="destinationTable = t.number"
                >
                    {{ t.number }}
                </button>
            </div>

            <button
                :disabled="!destinationTable"
                class="mt-8 w-full bg-rose-500 text-white py-6 rounded-2xl font-black uppercase italic disabled:opacity-30 shadow-xl"
                @click="confirmMove"
            >
                Konfirmasi Pindah Meja
            </button>
        </div>
    </div>
</template>
