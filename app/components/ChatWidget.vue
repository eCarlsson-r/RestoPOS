<script setup lang="ts">
type ChatMessage = { role: 'user' | 'assistant', text: string }

const CONVERSATION_KEY = 'restopos_chat_conversation'
const HISTORY_KEY = 'restopos_chat_history'

const { t } = useI18n()
const { branch } = useAuth()
const api = useApi()

const open = ref(false)
const sending = ref(false)
const draft = ref('')
const messages = ref<ChatMessage[]>([])
const scroller = ref<HTMLDivElement>()

let conversationId: string | null = null

onMounted(() => {
    conversationId = sessionStorage.getItem(CONVERSATION_KEY)
    try {
        messages.value = JSON.parse(sessionStorage.getItem(HISTORY_KEY) ?? '[]')
    } catch {
        messages.value = []
    }
})

const scrollToBottom = () => {
    nextTick(() => {
        if (scroller.value) scroller.value.scrollTop = scroller.value.scrollHeight
    })
}

watch([messages, sending], scrollToBottom, { deep: true })

const send = async () => {
    const message = draft.value.trim()
    if (!message || sending.value) return

    draft.value = ''
    messages.value.push({ role: 'user', text: message })
    sending.value = true

    try {
        const res = await api<{ reply: string, conversation_id: string }>('reservation-agent/chat', {
            method: 'POST',
            body: {
                message,
                branch_id: branch.value ?? 1,
                date: new Date().toISOString().slice(0, 10),
                conversation_id: conversationId
            }
        })
        conversationId = res.conversation_id
        sessionStorage.setItem(CONVERSATION_KEY, res.conversation_id)
        messages.value.push({ role: 'assistant', text: res.reply })
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(messages.value))
    } catch {
        messages.value.push({ role: 'assistant', text: t('chat.error') })
    } finally {
        sending.value = false
    }
}

const reset = () => {
    conversationId = null
    messages.value = []
    sessionStorage.removeItem(CONVERSATION_KEY)
    sessionStorage.removeItem(HISTORY_KEY)
}
</script>

<template>
    <div>
        <!-- Floating launcher -->
        <button
            v-if="!open"
            class="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-indigo-600 text-white pl-5 pr-2 py-2 rounded-full shadow-2xl shadow-indigo-200 active:scale-95 transition-all"
            @click="open = true"
        >
            <span class="text-[10px] font-black uppercase tracking-widest italic">{{ t('chat.open') }}</span>
            <span class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <UIcon
                    name="i-lucide-sparkles"
                    class="size-5"
                />
            </span>
        </button>

        <!-- Chat panel -->
        <div
            v-if="open"
            class="fixed bottom-6 right-4 sm:right-6 z-50 w-[92%] max-w-sm"
        >
            <div
                class="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
                style="height: min(34rem, 75vh)"
            >
                <!-- Header -->
                <div class="bg-indigo-600 text-white p-6 flex items-start justify-between">
                    <div>
                        <h3 class="text-lg font-black uppercase italic tracking-tighter leading-none">
                            {{ t('chat.title') }}
                        </h3>
                        <p class="text-[9px] font-black uppercase tracking-widest text-white/50 mt-2">
                            {{ t('chat.subtitle') }}
                        </p>
                    </div>
                    <div class="flex items-center gap-1">
                        <UButton
                            icon="i-lucide-rotate-ccw"
                            color="neutral"
                            variant="ghost"
                            size="sm"
                            class="text-white/70"
                            :title="t('chat.newChat')"
                            @click="reset"
                        />
                        <UButton
                            icon="i-lucide-x"
                            color="neutral"
                            variant="ghost"
                            size="sm"
                            class="text-white/70"
                            @click="open = false"
                        />
                    </div>
                </div>

                <!-- Messages -->
                <div
                    ref="scroller"
                    class="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50"
                >
                    <div class="flex">
                        <div class="max-w-[85%] bg-white border border-slate-100 rounded-3xl rounded-tl-lg px-5 py-3 text-sm shadow-sm">
                            {{ t('chat.greeting') }}
                        </div>
                    </div>

                    <div
                        v-for="(message, idx) in messages"
                        :key="idx"
                        class="flex"
                        :class="message.role === 'user' ? 'justify-end' : ''"
                    >
                        <div
                            class="max-w-[85%] px-5 py-3 text-sm shadow-sm whitespace-pre-line"
                            :class="message.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-3xl rounded-tr-lg'
                                : 'bg-white border border-slate-100 rounded-3xl rounded-tl-lg'"
                        >
                            {{ message.text }}
                        </div>
                    </div>

                    <div
                        v-if="sending"
                        class="flex"
                    >
                        <div class="bg-white border border-slate-100 rounded-3xl rounded-tl-lg px-5 py-4 shadow-sm flex gap-1.5">
                            <span
                                class="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                                style="animation-delay: 0ms"
                            />
                            <span
                                class="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                                style="animation-delay: 150ms"
                            />
                            <span
                                class="w-2 h-2 bg-slate-300 rounded-full animate-bounce"
                                style="animation-delay: 300ms"
                            />
                        </div>
                    </div>
                </div>

                <!-- Input -->
                <form
                    class="p-4 bg-white border-t border-slate-100 flex gap-2"
                    @submit.prevent="send"
                >
                    <input
                        v-model="draft"
                        name="message"
                        :placeholder="t('chat.placeholder')"
                        autocomplete="off"
                        class="flex-1 px-5 py-3 rounded-full bg-slate-50 border border-slate-100 text-sm focus:outline-none focus:border-indigo-300"
                    >
                    <UButton
                        type="submit"
                        icon="i-lucide-send"
                        color="primary"
                        class="rounded-full w-12 h-12 justify-center bg-indigo-600"
                        :disabled="sending || !draft.trim()"
                    />
                </form>
            </div>
        </div>
    </div>
</template>
