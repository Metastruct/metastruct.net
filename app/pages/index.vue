<template>
  <div id="index">
    <div class="hero">
      <div class="hero-body">
        <div class="container">
          <UpcomingEvents :events="events" />
          <div class="tile is-ancestor">
            <GameServers v-if="games.length" :games="games" />
            <!-- Explicit widths so the columns line up with the events row above. -->
            <div class="tile is-parent is-vertical" :class="games.length ? 'is-4' : 'is-6'">
              <CardTile v-for="(data, key) in middle" :key="`middle-${key}`" :data="data" />
            </div>
            <div class="tile is-parent is-vertical" :class="games.length ? 'is-4' : 'is-6'">
              <CardTile v-for="(data, key) in right" :key="`right-${key}`" :data="data" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

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
    for (const [game, playing] of Object.entries(playingStats)) {
      if (playing > mostPlayedCounter) {
        mostPlayedCounter = playing;
        mostPlayedGame = game;
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
  setup() {
    useHead({ title: "Home - Meta Construct" });
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
  beforeUnmount() {
    clearInterval(this.refreshTimer);
  },
  methods: {
    async refreshData() {
      await Promise.all([this.refreshServers(), this.refreshDiscord(), this.refreshEvents()]);
    },
    async refreshServers() {
      try {
        const data = await this.$mc("/servers");
        this.games = (data && data.games) || [];
      } catch (err) {
        console.error("servers", err);
      }
    },
    async refreshDiscord() {
      try {
        this.discordData = await this.$mc("/discord/guild/widget");
      } catch (err) {
        console.error("discord widget", err);
      }
    },
    async refreshEvents() {
      try {
        const data = await this.$mc("/discord/guild/events?limit=3");
        this.events = (data && data.events) || [];
      } catch (err) {
        console.error("discord events", err);
      }
    },
  },
};
</script>

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
