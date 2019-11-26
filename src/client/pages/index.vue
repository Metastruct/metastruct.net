<template lang="pug">
#index
    .hero
        .hero-body
            .container
                .tile.is-ancestor
                    .tile.is-parent.is-vertical.is-4(v-if="!$isEmpty(servers)")
                        ServerInfo.tile.is-child(v-for="(server, id) in servers", :server="server", :key="id", :id="id", tabindex="0")
                    .tile.is-parent.is-vertical
                        CardTile(v-for="(data, key) in middle", :data="data", :key="`middle-${key}`")
                    .tile.is-parent.is-vertical
                        CardTile(v-for="(data, key) in right", :data="data", :key="`right-${key}`")
                        .tile.is-child.card
                            Timeline(id="metastruct", sourceType="profile", :options="{ tweetLimit: 2, linkColor: "#0ce3ac", chrome: "nofooter noborders noheader transparent" }")

</template>

<script>
import ServerInfo from "@/components/ServerInfo.vue";
import CardTile from "@/components/CardTile.vue";
import Timeline from "vue-tweet-embed/timeline";

function getDiscordStats(discord) {
    if (discord.id) {
        let online = discord.members.length;

        let games = discord.members.filter(val => val.game).map(val => val.game.name);
        let playingStats = {};
        games.forEach(val => {
            if (!playingStats[val]) playingStats[val] = 0;
            playingStats[val]++;
        });
        let mostPlayedCounter = 0,
            mostPlayedGame = "";
        for (const game in playingStats) {
            if (playingStats.hasOwnProperty(game)) {
                const playing = playingStats[game];
                if (playing > mostPlayedCounter) {
                    mostPlayedCounter = playing;
                    mostPlayedGame = game;
                }
            }
        }

        return `${online} online, ${mostPlayedCounter} playing ${mostPlayedGame}`;
    }
}

export default {
    head() {
        return {
            title: "Home - Meta Construct",
        };
    },
    components: {
        ServerInfo,
        CardTile,
    },
    mounted() {
        setInterval(() => {
            this.refreshData();
        }, 20000);
    },
    async asyncData({ app }) {
        let servers = (await app.$axios.get("/api/v1/servers")).data;
        let discordData = (await app.$axios.get("https://discordapp.com/api/servers/164734812668559360/widget.json")).data;

        return {
            servers,
            discordData,
            middle: [
                {
                    path: "/addons",
                    title: "Add-ons",
                    subtitle: "Public add-ons we use on the server.",
                    icon: "puzzle",
                },
                {
                    path: "https://loadingscreen.metastruct.net",
                    title: "Gallery",
                    subtitle: "Upload, view and rate your favorite screenshots of the server!",
                    icon: "folder-image",
                },
                {
                    path: "/history",
                    title: "History",
                    subtitle: "Timeline of our past events.",
                    icon: "calendar-multiselect",
                },
                {
                    path: "https://banni.metastruct.net",
                    title: "Bans",
                    subtitle: "Our records of naughty people.",
                    icon: "minus-circle",
                },
            ],
            right: [
                {
                    path: "https://steamcommunity.com/groups/metastruct",
                    title: "Steam",
                    subtitle: "Become a member and participate to various forum discussions!",
                    icon: "steam",
                },
                {
                    path: discordData.instant_invite || "/discord",
                    title: "Discord",
                    subtitle: getDiscordStats(discordData),
                    icon: "discord",
                },
            ],
        };
    },
    methods: {
        async refreshData() {
            this.servers = (
                await this.$axios.get("/api/v1/servers", {
                    progress: false,
                })
            ).data;
            this.discordData = (await this.$axios.get("https://discordapp.com/api/servers/164734812668559360/widget.json", { progress: false })).data;
        },
    },
    computed: {
        discordStats() {
            return getDiscordStats(this.discordData);
        },
    },
};
</script>
