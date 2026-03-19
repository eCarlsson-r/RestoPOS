import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    const token = useCookie('auth_token')

    window.Pusher = Pusher

    const echo = new Echo({
        broadcaster: 'reverb' as 'pusher',
        key: config.public.echo?.key || 'h041wsoaf2e5u5irq4hd',
        wsHost: 'localhost', // Or your production host
        wsPort: 8080,
        wssPort: 8080,
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
        // Authentication for Private Channels
        authEndpoint: 'http://restosystem-api.test/api/broadcasting/auth',
        auth: {
            headers: {
                Authorization: token.value ? `Bearer ${token.value}` : '',
                Accept: 'application/json'
            }
        }
    })

    return {
        provide: {
            echo
        }
    }
})
