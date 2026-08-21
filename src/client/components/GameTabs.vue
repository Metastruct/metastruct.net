<template lang="pug">
.tabs.is-toggle.toggle-tabs.game-tabs(v-if="games.length > 1")
  ul
    li(v-for="g in games", :key="g.game", :class="{ 'is-active': g.game === selectedGame }")
      a(:href="'?game=' + g.game", :title="g.label", @click.prevent="select(g.game)")
        img.game-logo(:src="'/img/games/' + g.game + '.png'", :alt="g.label")
        span.game-label {{ shortLabel(g) }}
</template>

<style lang="scss">
.game-tabs {
  margin-bottom: 1rem;
}
</style>

<script>
import { selectedGameFor } from "@/components/GameServers.vue";

const SHORT_LABELS = {
  gmod: "GMod",
  minecraft: "Minecraft",
  ss13: "SS13",
  resonite: "Resonite",
  vrchat: "VRChat",
};

export default {
  props: {
    games: { type: Array, required: true },
  },
  computed: {
    selectedGame() {
      return selectedGameFor(this.games, this.$route.query.game);
    },
  },
  methods: {
    shortLabel(g) {
      return SHORT_LABELS[g.game] || g.label;
    },
    select(game) {
      if (game === this.selectedGame) return;
      this.$router.replace({ query: { ...this.$route.query, game } });
    },
  },
};
</script>
