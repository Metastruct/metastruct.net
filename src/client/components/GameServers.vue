<template lang="pug">
//- Rendered as the tile parent itself so Bulma's column sizing applies to the
//- accordion as a whole.
.tile.is-parent.is-vertical.is-4.game-servers(v-if="games.length")
  .game-category(
    v-for="g in games",
    :key="g.game",
    :class="{ 'is-open': g.game === openGame }"
  )
    button.game-category-header(
      type="button",
      :aria-expanded="g.game === openGame ? 'true' : 'false'",
      @click="toggle(g.game)"
    )
      img.game-logo(:src="`/img/games/${g.game}.png`", alt="")
      span.game-label {{ g.label }}
      span.game-summary(:class="{ 'is-empty': !playerTotal(g) }")
        b-icon(icon="account-multiple", size="is-small")
        span {{ playerTotal(g) || "empty" }}
      b-icon.game-chevron(icon="chevron-down", size="is-small")
    transition(
      name="game-collapse",
      @enter="onEnter",
      @after-enter="onSettled",
      @enter-cancelled="onSettled",
      @leave="onLeave",
      @after-leave="onSettled",
      @leave-cancelled="onSettled"
    )
      .game-category-body(v-show="g.game === openGame")
        .game-category-cards
          ServerCard(
            v-for="entry in g.entries",
            :key="entry.key",
            :entry="entry",
            :game="g.game",
            tabindex="0"
          )
</template>

<style lang="scss">
.game-servers {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  // Matches the surface of .card in _overrides: same fill, radius, glow and
  // purple hover as every other clickable card on the page.
  .game-category-header {
    display: flex;
    align-items: center;
    gap: 0.5em;
    width: 100%;
    padding: 0.65em 1em;
    border: none;
    border-radius: 4px;
    background: $grey-lighter;
    box-shadow: $card-shadow;
    color: $white-ter;
    font: inherit;
    font-size: 0.95rem;
    text-align: left;
    cursor: pointer;
    transition: background 0.1s ease-out, color 0.1s ease-out;

    &:hover,
    &:active {
      background: $secondary-dark;
    }

    &:focus-visible {
      outline: none;
      box-shadow: $card-shadow, 0 0 0 0.125em rgba($primary-light, 0.5);
    }

    .game-logo {
      width: 1.5em;
      height: 1.5em;
      border-radius: 3px;
      flex: none;
    }

    .game-label {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 600;
    }

    .game-summary {
      display: inline-flex;
      align-items: center;
      gap: 0.15em;
      flex: none;
      padding: 0.1em 0.5em 0.1em 0.3em;
      border-radius: 1em;
      background: rgba($black-bis, 0.33);
      font-size: 0.85em;
      font-variant-numeric: tabular-nums;

      &.is-empty {
        opacity: 0.55;
      }
    }

    .game-chevron {
      flex: none;
      transition: transform 0.25s ease-out;
    }
  }

  .game-category.is-open .game-category-header {
    color: $primary-light;

    .game-chevron {
      transform: rotate(180deg);
    }
  }

  .game-category-cards {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-top: 0.5rem;

    .server-card .playerlist {
      max-height: 16rem;
    }
  }

  .game-collapse-enter-active,
  .game-collapse-leave-active {
    transition: height 0.28s ease-out, opacity 0.28s ease-out;
  }

  .game-collapse-enter,
  .game-collapse-leave-to {
    opacity: 0;
  }
}
</style>

<script>
import ServerCard from "@/components/ServerCard.vue";

const DEFAULT_GAME = "gmod";

function defaultGameFor(games) {
  if (games.some(g => g.game === DEFAULT_GAME)) return DEFAULT_GAME;
  return games.length ? games[0].game : null;
}

// v-show restores `display` in the same task the enter hook runs in, so the
// starting height has to be forced through layout or the browser has nothing
// to animate away from and the expand snaps open.
function freezeHeight(el, height) {
  el.style.overflow = "hidden";
  el.style.height = `${height}px`;
  return el.offsetHeight;
}

export default {
  components: { ServerCard },
  props: {
    games: { type: Array, required: true },
  },
  data() {
    return { openGame: defaultGameFor(this.games) };
  },
  watch: {
    // The list is re-fetched every 20s; only fall back if the open game vanished,
    // never when it was closed on purpose.
    games(games) {
      if (this.openGame && !games.some(g => g.game === this.openGame)) {
        this.openGame = defaultGameFor(games);
      }
    },
  },
  methods: {
    playerTotal(g) {
      return g.entries.reduce((total, entry) => total + (entry.playerCount || 0), 0);
    },
    toggle(game) {
      this.openGame = game === this.openGame ? null : game;
    },
    // Height is animated from an explicit pixel value, then handed back to
    // `auto` so cards can grow as players join.
    onEnter(el) {
      const target = el.scrollHeight;
      freezeHeight(el, 0);
      el.style.height = `${target}px`;
    },
    onLeave(el) {
      freezeHeight(el, el.scrollHeight);
      el.style.height = "0";
    },
    onSettled(el) {
      el.style.height = "";
      el.style.overflow = "";
    },
  },
};
</script>
