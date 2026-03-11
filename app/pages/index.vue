<script setup>
const credentials = ref({ username: '', password: '' })
const { login } = useAuth() // We'll define this helper

definePageMeta({
    layout: false
})

const handleLogin = async () => {
    try {
        const user = await login(credentials.value)
        // Redirect based on job-type from your employee table
        if (user.type === 'ADMIN') await navigateTo('/admin/dashboard')
        else if (user.type === 'KITCHEN') await navigateTo('/kitchen')
        else await navigateTo('/pos/floor-map') // Waiters
    } catch (e) {
        console.error(e) // Better debugging
        alert(e.message || 'Invalid Credentials')
    }
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-linear-to-b from-orange-50 via-red-300 to-red-600 p-6">
        <div class="w-full max-w-md space-y-8 bg-white p-10 rounded-[3rem] shadow-2xl">
            <div class="text-center">
                <h1 class="text-4xl font-black italic tracking-tighter uppercase">
                    Republican
                </h1>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                    Staff Access Only
                </p>
            </div>

            <div class="space-y-4">
                <input
                    v-model="credentials.username"
                    type="text"
                    placeholder="Username"
                    class="w-full p-4 bg-slate-100 border-none rounded-2xl font-black text-center focus:ring-2 ring-black transition-all"
                >
                <input
                    v-model="credentials.password"
                    type="password"
                    placeholder="Password"
                    class="w-full p-4 bg-slate-100 border-none rounded-2xl font-black text-center focus:ring-2 ring-black transition-all"
                >
                <UButton
                    block
                    size="xl"
                    label="Clock In"
                    color="primary"
                    class="py-5 font-black uppercase italic text-sm shadow-xl shadow-primary/20"
                    @click="handleLogin"
                />
            </div>
        </div>
    </div>
</template>
