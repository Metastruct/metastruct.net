<template lang="pug">
#index
    .hero
        .hero-body
            .container
                .tile.is-ancestor
                    .tile.is-parent.is-vertical.is-4
                        ServerInfo.tile.is-child(v-for="(server, id) in servers", :server="server", :key="id", :id="id", tabindex="0")
                    .tile.is-parent.is-vertical.is-4
                        nuxt-link.tile.is-child.notification(to="/addons")
                            .background
                                b-icon(icon="puzzle")
                            p.title Add-ons
                            p.subtitle Public add-ons we use on our server.
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
                        a.tile.is-child.notification(href="https://banni.metastruct.net", target="_blank")
                            .background
                                b-icon(icon="minus-circle")
                            p.title Bans
                            p.subtitle List of naughty people.
                    .tile.is-parent.is-vertical.is-4
                        a.tile.is-child.notification(href="https://steamcommunity.com/groups/metastruct", target="_blank")
                            .background
                                b-icon(icon="steam")
                            p.title Steam
                            p.subtitle Become a member and participate to various forum discussions!
                        a.tile.is-child.notification(:href="discordData.instant_invite || '/discord'", target="_blank")
                            .background
                                b-icon(icon="discord")
                            p.title Discord
                            p.subtitle {{ discordStats }}
                        .tile.is-child.notification(style="padding: 1em;")
                            a.twitter-timeline(data-dnt="true", data-theme="dark", data-link-color="#0ce3ac", data-chrome="nofooter noborders noheader transparent", data-tweet-limit="2", href="https://twitter.com/metastruct?ref_src=twsrc%5Etfw")
                                script(async, src="https://platform.twitter.com/widgets.js", charset="utf-8")

</template>

<style lang="scss">

@import "@/assets/overrides.scss";

#index {
    .notification {
        padding-right: 25%;

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
        .background {
            .icon {
                transition: transform 0.1s linear;
            }
        }

        &:hover, &:active, &:focus {
            .background {
                .icon {
                    transform: scale(1.125, 1.125);
                }
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

            discordData: {},
        }
    },
    mounted() {
        this.refreshData()

        setInterval(() => {
            this.refreshData()
        }, 20000)
    },
    methods: {
        refreshData() {
            axios.get("/servers.json")
                .then(res => {
                    this.servers = res.data
                })
                .catch(console.error)

            axios.get("https://discordapp.com/api/servers/164734812668559360/widget.json")
                .then(res => {
                    this.discordData = res.data
                })
                .catch(console.error)
        }
    },
    computed: {
        discordStats() {
            const discord = this.discordData

            if (discord.id) {
                let online = discord.members.length

                let games = discord.members.filter(val => val.game).map(val => val.game.name)
                let playingStats = {}
                games.forEach(val => {
                    if (!playingStats[val]) playingStats[val] = 0
                    playingStats[val]++
                })
                let mostPlayedCounter = 0,
                    mostPlayedGame    = ""
                for (const game in playingStats) {
                    if (playingStats.hasOwnProperty(game)) {
                        const playing = playingStats[game]
                        if (playing > mostPlayedCounter) {
                            mostPlayedCounter = playing
                            mostPlayedGame    = game
                        }
                    }
                }

                return `${online} online, ${mostPlayedCounter} playing ${mostPlayedGame}`
            }
        }
    }
}

</script>
