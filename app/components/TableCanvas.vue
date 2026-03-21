<template>
    <div
        :class="[
            `grid gap-4 p-2 mx-auto h-${16*(props.divisor > 6 ? 6 : props.divisor)} relative`,
            `grid-cols-${props.divisor > 12 ? 12 : props.divisor}`,
            `grid-rows-${props.divisor > 6 ? 6 : props.divisor}`
        ]"
        @dragover.prevent
    >
        <div
            v-if="isShiftingMode"
            class="absolute inset-0 grid pointer-events-none opacity-5"
            :style="`grid-template-columns: repeat(${props.divisor}, 1fr); grid-template-rows: repeat(${props.divisor}, 1fr);` "
        >
            <div
                v-for="n in (props.divisor * props.divisor)"
                :key="n"
                class="border border-black"
            />
        </div>

        <div
            v-for="table in props.tables"
            :key="table.table_number"
            :draggable="isShiftingMode"
            :class="getInnerClass(table)"
            :style="getTableStyle(table)"
            @dragstart="(e) => onDragStart(e, table)"
            @dragend="(e) => onDragEnd(e, table)"
            @click="$emit('select', table)"
        >
            <span class="text-white font-black text-xl">{{ table.table_number }}</span>

            <BuffetTimer
                v-if="table.status === 'occupied' && getBuffetEndTime(table)"
                :end-time="getBuffetEndTime(table)"
                class="mt-1 bg-white/90 px-1 rounded shadow-sm"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Table, Sale } from '~/types/master'

const props = defineProps<{
    tables: Table[]
    isShiftingMode?: boolean
    isMergingMode?: boolean
    selectedId?: string | number | null
    divisor: number
}>()

const emit = defineEmits(['select', 'position-change'])

const onDragStart = (e: DragEvent, table: Table) => {
    if (e.dataTransfer) {
        e.dataTransfer.setData('text/plain', table.table_number)
        e.dataTransfer.dropEffect = 'move'
    }
}

const onDragEnd = (e: DragEvent, table: Table) => {
    if (!props.isShiftingMode) return

    const container = (e.target as HTMLElement).parentElement
    if (!container) return

    const rect = container.getBoundingClientRect()

    const relativeX = e.clientX - rect.left
    const relativeY = e.clientY - rect.top

    const gridColumnCount = props.divisor
    const gridRowCount = props.divisor

    const cellWidth = rect.width / gridColumnCount
    const cellHeight = rect.height / gridRowCount

    let newCol = Math.floor(relativeX / cellWidth) + 1
    let newRow = Math.floor(relativeY / cellHeight) + 1

    const isH = table.direction === 'H'
    const colSpan = isH ? (table.size || 1) : 1
    const rowSpan = isH ? 1 : (table.size || 1)

    newCol = Math.max(1, Math.min(newCol, gridColumnCount - colSpan + 1))
    newRow = Math.max(1, Math.min(newRow, gridRowCount - rowSpan + 1))

    emit('position-change', table, newCol, newRow)
}

const getStatusClasses = (status: Table['status']) => {
    switch (status) {
        case 'available': return 'bg-emerald-500/90 border-emerald-400 text-white'
        case 'occupied': return 'bg-rose-500/90 border-rose-400 text-white'
        case 'reserved': return 'bg-amber-500/90 border-amber-400 text-white'
        case 'dirty': return 'bg-slate-400/90 border-slate-300 text-white'
        default: return 'bg-gray-200'
    }
}

const getTableStyle = (table: Table) => {
    const isH = table.direction === 'H'
    const colSpan = isH ? (table.size || 1) : 1
    const rowSpan = isH ? 1 : (table.size || 1)

    return {
        gridColumn: `${table.position_x} / span ${colSpan}`,
        gridRow: `${table.position_y} / span ${rowSpan}`,
        cursor: props.isShiftingMode ? 'move' : 'pointer'
    }
}

const getInnerClass = (table: Table) => {
    return `flex flex-wrap justify-center gap-2 items-center h-${16 * (table.size || 1)} rounded-2xl border-2 shadow-sm transition-all hover:scale-105 active:scale-95 ${getStatusClasses(table.status)}`
}

const getBuffetEndTime = (table: Table): string => {
    const activeSale = table.sales?.[0] as Sale | undefined
    return activeSale?.buffet_end_at || ''
}
</script>
