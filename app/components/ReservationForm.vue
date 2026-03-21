<script setup lang="ts">
import type { ApiResponse, Branch, BuffetPackage, Customer, Reservation } from '~/types/master'

const props = defineProps<{
    reservationId?: number | null
}>()
const { branch } = useAuth()
const branches = ref<Branch[]>([])

const emit = defineEmits(['saved', 'close'])
const nuxtApp = useNuxtApp()
const api = useApi()

// Form State
const state = ref({
    branch_id: Number(branch.value) || 1,
    customer_id: 1,
    event_date: '',
    event_time: '',
    buffet_id: 1,
    guaranteed_pax: 20,
    deposit_amount: 0,
    notes: ''
})

const searchTerm = ref('')
const searchLoading = ref(false)
const customers = ref<Customer[]>([])

const isAddingCustomer = ref(false)
const newCustomerName = ref('')

const openQuickAdd = (name: string) => {
    newCustomerName.value = name
    isAddingCustomer.value = true
}

const searchCustomers = async (q: string) => {
    try {
        const response = await api<Customer[] | ApiResponse<Customer[]>>((q && q != '') ? `customers?q=${q}` : `customers`)
        return Array.isArray(response) ? response : (response.data || [])
    } catch (error) {
        console.error('Search failed:', error)
        return []
    }
}

// Watch the search box and update the customers list
watch(searchTerm, async (newVal) => {
    searchLoading.value = true
    try {
        customers.value = await searchCustomers(newVal)
    } finally {
        searchLoading.value = false
    }
}, { immediate: true }) // Fetch initial list on load

const onQuickCustomerSave = async (formData: Partial<Customer>) => {
    try {
        const response = await api<ApiResponse<Customer>>('customers', {
            method: 'POST',
            body: formData
        })

        const newCustomer = response.data

        // Refresh the list manually so the new customer appears in the SelectMenu
        if (!customers.value.some(c => c.id === newCustomer.id)) {
            customers.value.push(newCustomer)
        }

        state.value.customer_id = newCustomer.id
        isAddingCustomer.value = false

        nuxtApp.runWithContext(() => {
            useToast().add({ title: 'Customer registered and selected!', color: 'success' })
        })
    } catch (e) {
        console.error(e)
        nuxtApp.runWithContext(() => {
            useToast().add({ title: 'Failed to create customer', color: 'error' })
        })
    }
}

// Fetch Buffet Packages for the dropdown
const packagesResponse = await api<ApiResponse<BuffetPackage[]>>('buffet')
const packages = computed(() => packagesResponse?.data || [])

const submitForm = async () => {
    try {
        await api('reservations', {
            method: props.reservationId ? 'PUT' : 'POST',
            body: state.value
        })
        emit('saved')
        nuxtApp.runWithContext(() => {
            useToast().add({ title: 'Reservation Secured!', color: 'success' })
        })
    } catch (e) {
        console.error(e)
        nuxtApp.runWithContext(() => {
            useToast().add({ title: 'Error saving reservation', color: 'error' })
        })
    }
}

onMounted(async () => {
    const data = await useApi<Branch[] | ApiResponse<Branch[]>>('branches')
    if (Array.isArray(data)) {
        branches.value = data
    } else if (data && typeof data === 'object' && 'data' in data) {
        branches.value = (data as ApiResponse<Branch[]>).data
    } else {
        branches.value = []
    }

    if (props.reservationId) {
        const response = await api<ApiResponse<Reservation>>(`reservations/${props.reservationId}`)
        const res = response.data
        if (res) {
            state.value = {
                branch_id: res.branch_id,
                customer_id: res.customer_id,
                event_date: res.event_date,
                event_time: res.event_time,
                buffet_id: res.buffet_id,
                guaranteed_pax: res.guaranteed_pax,
                deposit_amount: res.deposit_amount,
                notes: res.notes || ''
            }
        }
    }
})
</script>

<template>
    <div class="space-y-6">
        <UForm
            :state="state"
            class="space-y-4"
            @submit="submitForm"
        >
            <UFormField
                label="Select Branch"
                required
                :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
            >
                <USelectMenu
                    v-model="state.branch_id"
                    class="w-full shadow-sm"
                    :items="branches"
                    label-key="name"
                    value-key="id"
                />
            </UFormField>
            <UFormField
                label="Search Customer"
                required
                :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
            >
                <USelectMenu
                    v-model="state.customer_id"
                    v-model:search-term="searchTerm"
                    class="w-full shadow-sm"
                    :items="customers"
                    :loading="searchLoading"
                    ignore-filter
                    placeholder="Type name or mobile..."
                    label-key="name"
                    value-key="id"
                >
                    <template #empty>
                        <div class="p-4 text-center">
                            <p class="text-sm text-gray-500 mb-3 font-medium">
                                No customer found for "{{ searchTerm }}"
                            </p>
                            <UButton
                                size="sm"
                                icon="i-lucide-user-plus"
                                label="Register New Customer"
                                variant="soft"
                                class="font-bold underline"
                                @click="openQuickAdd(searchTerm)"
                            />
                        </div>
                    </template>
                </USelectMenu>
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
                <UFormField
                    label="Date of Event"
                    required
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <UInput
                        v-model="state.event_date"
                        class="w-full shadow-sm"
                        type="date"
                    />
                </UFormField>
                <UFormField
                    label="Arrival Time"
                    required
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <UInput
                        v-model="state.event_time"
                        class="w-full shadow-sm"
                        type="time"
                    />
                </UFormField>
            </div>

            <UFormField
                label="Buffet Package"
                :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
            >
                <USelectMenu
                    v-model="state.buffet_id"
                    class="w-full shadow-sm"
                    :items="packages"
                    label-key="name"
                    value-key="id"
                    placeholder="Select a menu tier..."
                />
            </UFormField>

            <div class="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200">
                <UFormField
                    label="Min. Pax"
                    :ui="{ label: 'text-[10px] font-black uppercase text-primary-400 tracking-widest' }"
                >
                    <UInput
                        v-model="state.guaranteed_pax"
                        type="number"
                        class="w-full shadow-sm font-black text-lg"
                    />
                </UFormField>
                <UFormField
                    label="Deposit (Rp)"
                    :ui="{ label: 'text-[10px] font-black uppercase text-primary-400 tracking-widest' }"
                >
                    <UInput
                        v-model="state.deposit_amount"
                        type="number"
                        class="w-full shadow-sm font-black text-lg"
                    />
                </UFormField>
            </div>

            <UFormField
                label="Special Instructions"
                :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
            >
                <UTextarea
                    v-model="state.notes"
                    class="w-full shadow-sm"
                    placeholder="e.g. Peanut allergy, Birthday cake setup..."
                    :rows="4"
                />
            </UFormField>

            <UButton
                type="submit"
                block
                size="xl"
                color="primary"
                class="font-black uppercase italic py-4 rounded-2xl shadow-lg shadow-primary-100"
            >
                Confirm Reservation
            </UButton>

            <UButton
                variant="ghost"
                color="neutral"
                block
                class="text-[10px] font-bold uppercase tracking-widest"
                @click="$emit('close')"
            >
                Cancel & Go Back
            </UButton>
        </UForm>

        <UModal
            v-model:open="isAddingCustomer"
            scrollable
            title="Register New Customer"
            description="Please fill in the customer details below."
            :ui="{
                title: 'text-xl font-black uppercase italic tracking-tighter'
            }"
            class="sm:max-w-xl"
        >
            <template #body>
                <CustomerForm
                    :item="{ name: newCustomerName }"
                    @save="onQuickCustomerSave"
                    @close="isAddingCustomer = false"
                />
            </template>
        </UModal>
    </div>
</template>
