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
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    tables: {
        type: Array,
        required: true
    },
    isShiftingMode: {
        type: Boolean,
        default: false
    },
    isMergingMode: {
        type: Boolean,
        default: false
    },
    selectedId: {
        type: [String, Number],
        default: null
    },
    divisor: {
        type: Number,
        default: 8
    }
})
const emit = defineEmits(['select', 'position-change'])

const onDragStart = (e, table) => {
    // We store the original starting position to calculate offset if needed,
    // though in a grid, the mouse position at drop is usually sufficient.
    e.dataTransfer.setData('text/plain', table.table_number)
    e.dataTransfer.dropEffect = 'move'
}

const onDragEnd = (e, table) => {
    if (!props.isShiftingMode) return

    const container = e.target.parentElement
    const rect = container.getBoundingClientRect()

    // 1. Get the current mouse position relative to the grid container
    const relativeX = e.clientX - rect.left
    const relativeY = e.clientY - rect.top

    // 2. Calculate the width/height of a single grid cell
    const gridColumnCount = props.divisor // e.g., 8 or 24
    const gridRowCount = props.divisor

    const cellWidth = rect.width / gridColumnCount
    const cellHeight = rect.height / gridRowCount

    // 3. Determine the Grid Line Index (starts at 1)
    // Math.floor gives us the cell index, +1 gives us the CSS Grid Line
    let newCol = Math.floor(relativeX / cellWidth) + 1
    let newRow = Math.floor(relativeY / cellHeight) + 1

    // 4. Boundary Protection
    // Ensure the table doesn't bleed past the last grid line
    const isH = table.direction === 'H'
    const colSpan = isH ? (table.size || 1) : 1
    const rowSpan = isH ? 1 : (table.size || 1)

    newCol = Math.max(1, Math.min(newCol, gridColumnCount - colSpan + 1))
    newRow = Math.max(1, Math.min(newRow, gridRowCount - rowSpan + 1))

    emit('position-change', table, newCol, newRow)
}

const getStatusClasses = (status) => {
    const map = {
        available: 'bg-emerald-500/90 border-emerald-400 text-white',
        occupied: 'bg-rose-500/90 border-rose-400 text-white',
        reserved: 'bg-amber-500/90 border-amber-400 text-white',
        dirty: 'bg-slate-400/90 border-slate-300 text-white'
    }
    return map[status] || 'bg-gray-200'
}

const getTableStyle = (table) => {
    const isH = table.direction === 'H'
    const colSpan = isH ? (table.size || 1) : 1
    const rowSpan = isH ? 1 : (table.size || 1)

    return {
        gridColumn: `${table.position_x} / span ${colSpan}`,
        gridRow: `${table.position_y} / span ${rowSpan}`,
        cursor: props.isShiftingMode ? 'move' : 'pointer'
    }
}

// Returns static classes only
const getInnerClass = (table) => {
    return `flex justify-center items-center h-${16 * (table.size || 1)} rounded-2xl border-2 shadow-sm transition-all hover:scale-105 active:scale-95 ${getStatusClasses(table.status)}`
}
</script>
