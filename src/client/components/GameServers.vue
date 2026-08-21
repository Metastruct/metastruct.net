<template lang="pug">
.game-servers
  .tabs.is-toggle.game-tabs(v-if="games.length > 1")
    ul
      li(v-for="g in games", :key="g.game", :class="{ 'is-active': g.game === selectedGame }")
        a(:href="'?game=' + g.game", :title="g.label", @click.prevent="select(g.game)")
          img.game-logo(:src="logo(g.game)", :alt="g.label")
          span.game-label(v-if="g.game === selectedGame") {{ g.label }}
  template(v-if="current")
    ServerCard.tile.is-child(
      v-for="entry in current.entries",
      :key="entry.key",
      :entry="entry",
      :game="current.game",
      tabindex="0"
    )
</template>

<style lang="scss">
.game-servers {
  display: flex;
  flex-direction: column;

  .game-tabs {
    margin-bottom: 0.75rem;

    ul {
      flex-wrap: wrap;
    }

    a {
      gap: 0.4em;
      padding: 0.5em 0.75em;
    }

    .game-label {
      white-space: nowrap;
    }

    .game-logo {
      width: 1.25em;
      height: 1.25em;
      border-radius: 3px;
      flex: none;
    }
  }

  .server-card:not(:last-child) {
    margin-bottom: 1.5rem;
  }
}
</style>

<script>
import ServerCard from "@/components/ServerCard.vue";

export default {
  components: { ServerCard },
  props: {
    games: { type: Array, required: true },
  },
  computed: {
    selectedGame() {
      const wanted = this.$route.query.game;
      if (this.games.some(g => g.game === wanted)) return wanted;
      return this.games.length ? this.games[0].game : null;
    },
    current() {
      return this.games.find(g => g.game === this.selectedGame) || null;
    },
  },
  methods: {
    logo(game) {
      return `/img/games/${game}.png`;
    },
    select(game) {
      if (game === this.selectedGame) return;
      this.$router.replace({ query: { ...this.$route.query, game } });
    },
  },
};
</script>
