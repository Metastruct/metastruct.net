<template lang="pug">

a.notification.server-info(@click="open(`steam://connect/${server.serverinfo.address}:${server.serverinfo.port}`)")
    .background-container
        .background
    p.title {{ idToName[id] || "???" }}
    p.subtitle
        | {{ 'Online since ' + ((server.time - server.started) / 60 / 60).toFixed(1) + " hours" }}
        br
        | {{ `${server.playerinfo.length > 0 ? server.playerinfo.length + " players": "Empty,"} on ${server.serverinfo.map}` }}
    ul.playerlist
        li(v-if="server.playerinfo.length < 1") Absolutely nobody. Join us?
        li.player(v-for="player in server.playerinfo", :class="{ 'is-admin': player.IsAdmin }")
            a(title="View profile", :href="`https://steamcommunity.com/profiles/[U:1:${player.AccountID}]`")
                img.avatar(:src="player.avatarfull")
                span.nick {{ player.Nick }}
            a.join-goto(:title="'Join and go to ' + player.Nick", :href="`steam://connect/${server.serverinfo.address}:${server.serverinfo.port}/GO:_${player.EntIndex}`")
                b-icon(icon="arrow-right", type="is-success")
    .server-info-bottom Join us!

</template>

<style lang="scss">

@import "@/assets/overrides.scss";

.notification.server-info {
    display: block;
    position: relative;
    z-index: 0;
    padding-right: 1.5rem;

    .background-container {
        position: absolute;
        z-index: -1;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        clip-path: inset(0px 0px 0px 0px);

        .background {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(0deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("~static/gm_construct_m.jpg");
            background-size: cover;
            background-position: center center;
            filter: brightness(100%) blur(3px);
            transform-origin: center;
            transition: margin 0.25s ease-out, filter 0.25s ease-out;
        }
    }

    &:hover {
        .background {
            filter: brightness(125%) blur(0px);
            margin: -8px;
        }
    }

    .playerlist {
        margin: 1.5em 0;
        padding: 8px;
        background: rgba(0, 0, 0, 0.36);
        max-height: 184px;
        overflow-y: auto;

        .player {
            display: flex;
            align-items: center;

            a {
                text-decoration: none;

                &:hover {
                    filter: brightness(75%);
                }
            }

            .nick {
                display: inline-block;
                font-size: 0.9em;
                color: $info;
            }

            &.is-admin .nick {
                color: lighten(adjust-hue($info, 80), 5%) !important;
            }

            .avatar {
                height: 20px;
                border-radius: 50%;
                margin-right: 0.33em;
            }

            .join-goto {
                margin-left: auto;
            }
        }
    }

    .server-info-bottom {
        display: flex;
        justify-content: space-around;
        font-size: 1.5em;
        color: $primary;
    }
}

</style>

<script>

export default {
    props: [ "server", "id" ],
    data() {
        return {
            idToName: { eu1: "Europe #1", eu2: "Europe #2" }
        }
    },
    methods: {
        open(url) {
            window.open(url, "_blank")
        }
    }
}

</script>


