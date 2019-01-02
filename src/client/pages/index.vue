<template lang="pug">
#index
    .hero
        .hero-body
            .container
                .tile.is-ancestor
                    .tile.is-parent.is-vertical.is-4
                        ServerInfo.tile.is-child(v-for="(server, id) in servers" :server="server" :key="id" :id="id")
                    .tile.is-parent
                        .tile.is-child.notification.is-info
                            | Meme
                    .tile.is-parent
                        .tile.is-child.notification.is-warning
                            | Meme

</template>

<style lang="scss">

@import "@/assets/overrides.scss";

.notification {
    box-shadow: 0px 0px 12px darken($dark, 5%);
}

</style>

<script>

import ServerInfo from "@/components/ServerInfo.vue"
import axios from "axios"

export default {
    components: {
        ServerInfo
    },
    data() {
        return {
            servers: {},
        }
    },
    mounted() {
        this.refreshServerData()

        setInterval(() => {
            this.refreshServerData()
        }, 20000)
    },
    methods: {
        refreshServerData() {
            axios.get("/api/servers")
                .then(res => {
                    this.servers = res.data
                })
                .catch(console.error)
        }
    },
}

</script>
