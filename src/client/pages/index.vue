<template lang="pug">
#index
    .hero
        .hero-body
            .container
                .tile.is-ancestor
                    .tile.is-parent.is-vertical.is-4
                        ServerInfo.tile.is-child(v-for="(server, id) in servers" :server="server" :key="id" :id="id")
                    .tile.is-parent.is-vertical.is-4
                        nuxt-link.tile.is-child.notification(to="/addons")
                            .background
                                b-icon(icon="puzzle")
                            p.title Addons
                            p.subtitle Public addons we use on our server.
                        a.tile.is-child.notification(href="https://loadingscreen.metastruct.net", target="_blank")
                            .background
                                b-icon(icon="folder-image")
                            p.title Gallery
                            p.subtitle Upload, view and rate your favorite screenshots!
                        nuxt-link.tile.is-child.notification(to="/history")
                            .background
                                b-icon(icon="calendar-multiselect")
                            p.title History
                            p.subtitle Timeline of meaningful events.
                    .tile.is-parent.is-vertical.is-4
                        .tile.is-child.notification(style="padding: 1em;")
                            a.twitter-timeline(data-dnt="true", data-theme="dark", data-link-color="#0ce3ac", data-chrome="nofooter noborders noheader transparent", data-tweet-limit="4", href="https://twitter.com/metastruct?ref_src=twsrc%5Etfw")
                                script(async, src="https://platform.twitter.com/widgets.js", charset="utf-8")
                        a.tile.is-child.notification(href="https://banni.metastruct.net", target="_blank")
                            .background
                                b-icon(icon="minus-circle")
                            p.title Bans
                            p.subtitle List of naughty people.

</template>

<style lang="scss">

@import "@/assets/overrides.scss";

.notification {
    position: relative;
    color: $light;
    box-shadow: 0px 0px 12px darken($dark, 5%);
    background: lighten($dark, 10%);
    padding: 1.5em;

    .background {
        position: absolute;
        display: flex;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 1.5rem;
        justify-content: flex-end;
        align-items: flex-end;

        .icon {
            transform-origin: center;
            height: 4rem;
            width: 4rem;
            color: rgba(255, 255, 255, 0.25);

            .mdi::before {
                font-size: 86px !important;
            }
        }
    }
}

a.notification {
    color: $light;

    p.title {
        color: $link;
    }

    p.subtitle {
        color: $light;
    }

    transition: background 0.1s ease-out;

    .background {
        .icon {
            transition: transform 0.1s linear;
        }
    }

    &:hover {
        background: $secondary;

        .background {
            .icon {
                transform: scale(1.125, 1.125);
            }
        }
    }
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
