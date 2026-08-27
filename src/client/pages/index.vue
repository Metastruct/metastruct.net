<template lang="pug">
#index
  .hero
    .hero-body
      .container
        UpcomingEvents(:events="events")
        .tile.is-ancestor
          GameServers(v-if="games.length", :games="games")
          //- Explicit widths so the columns line up with the events row above.
          .tile.is-parent.is-vertical(:class="games.length ? 'is-4' : 'is-6'")
            CardTile(v-for="(data, key) in middle", :data="data", :key="`middle-${key}`")
          .tile.is-parent.is-vertical(:class="games.length ? 'is-4' : 'is-6'")
            CardTile(v-for="(data, key) in right", :data="data", :key="`right-${key}`")
            //- .tile.is-child.card
            //-   Timeline#metastruct(
            //-     sourceType="profile",
            //-     :options="{ tweetLimit: 2, theme: 'dark', linkColor: '#0ce3ac', chrome: 'nofooter noborders noheader transparent' }",
            //-     widget-class="vue-twitter-embed"
            //-   )
</template>

<style lang="scss">
// .vue-twitter-embed {
//   display: flex;
//   height: auto;
//   overflow-y: auto;
// }
// .twitter-timeline {
//   margin: calc(1.5rem - 10px) !important;
//   width: calc(100% - 1.5em) !important;
// }
</style>

<script>
import GameServers from "@/components/GameServers.vue";
import CardTile from "@/components/CardTile.vue";
import UpcomingEvents from "@/components/UpcomingEvents.vue";
// import { Timeline } from "vue-tweet-embed";

function getDiscordStats(discord) {
  if (discord?.id) {
    const online = discord.presence_count;

    const games = discord.members.filter(val => val.game).map(val => val.game.name);
    const playingStats = {};
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
  } else {
    return "Failed to retrieve Discord widget data";
  }
}

export default {
  components: {
    GameServers,
    CardTile,
    UpcomingEvents,
    // Timeline,
  },
  data() {
    return {
      games: [],
      events: [],
      discordData: {},
      middle: [
        {
          path: "/addons",
          title: "Add-ons",
          subtitle: "Public add-ons we use on our servers.",
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
          path: "/bans",
          title: "Bans",
          subtitle: "Our records of naughty people.",
          icon: "minus-circle",
        },
      ],
    };
  },
  head() {
    return {
      title: "Home - Meta Construct",
    };
  },
  computed: {
    discordStats() {
      return getDiscordStats(this.discordData);
    },
    right() {
      return [
        {
          path: "https://steamcommunity.com/groups/metastruct",
          title: "Steam",
          subtitle: "Become a member and participate to various forum discussions!",
          icon: "steam",
        },
        {
          path: this.discordData?.instant_invite || "https://discord.gg/CHuxFSd",
          title: "Discord",
          subtitle: getDiscordStats(this.discordData),
          icon: "discord",
        },
      ];
    },
  },
  mounted() {
    this.refreshData();
    this.refreshTimer = setInterval(() => {
      this.refreshData();
    }, 20000);
  },
  beforeDestroy() {
    clearInterval(this.refreshTimer);
  },
  methods: {
    async refreshData() {
      await Promise.all([this.refreshServers(), this.refreshDiscord(), this.refreshEvents()]);
    },
    async refreshServers() {
      try {
        const { data } = await this.$axios.get(`${this.$config.metaconcordUrl}/servers`, {
          progress: false,
        });
        this.games = (data && data.games) || [];
      } catch (err) {
        console.error("servers", err);
      }
    },
    async refreshDiscord() {
      try {
        const { data } = await this.$axios.get(
          `${this.$config.metaconcordUrl}/discord/guild/widget`,
          {
            progress: false,
          }
        );
        this.discordData = data;
      } catch (err) {
        console.error("discord widget", err);
      }
    },
    async refreshEvents() {
      try {
        const { data } = await this.$axios.get(
          `${this.$config.metaconcordUrl}/discord/guild/events?limit=3`,
          {
            progress: false,
          }
        );
        this.events = (data && data.events) || [];
      } catch (err) {
        console.error("discord events", err);
      }
    },
  },
};
</script>
