<template>
    <section class="section">
        <h1 class="title has-text-centered" v-if="data && data.items">{{data.items[0].statistics.subscriberCount}}</h1>
    </section>
</template>

<script>
    import io from 'socket.io-client';

    export default {
        name: 'HomePage',

        data() {
            return {
                data: null,
                socket : io('localhost:3000')
            }
        },

        mounted() {
            this.socket.on('ON_TEST', (data) => {
                this.data = data
            });
        },

        created() {
            this.socket.emit('JOIN_CHANEL', this.$route.query.id)
        }
    }
</script>
