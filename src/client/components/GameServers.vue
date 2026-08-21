<template lang="pug">
//- Rendered as the tile parent itself so Bulma's vertical tile spacing and
//- stretching apply to the cards directly.
.tile.is-parent.is-vertical.is-4.game-servers(v-if="current")
  ServerCard.tile.is-child(
    v-for="entry in current.entries",
    :key="entry.key",
    :entry="entry",
    :game="current.game",
    tabindex="0"
  )
</template>

<script>
import ServerCard from "@/components/ServerCard.vue";

/** Game from the ?game= query when it exists in the list, else the first game. */
export function selectedGameFor(games, wanted) {
  if (games.some(g => g.game === wanted)) return wanted;
  return games.length ? games[0].game : null;
}

export default {
  components: { ServerCard },
  props: {
    games: { type: Array, required: true },
  },
  computed: {
    current() {
      const selected = selectedGameFor(this.games, this.$route.query.game);
      return this.games.find(g => g.game === selected) || null;
    },
  },
};
</script>
