<template>
  <!-- Rendered as the tile parent itself so Bulma's column sizing applies to the
    accordion as a whole. -->
  <div v-if="games.length" class="tile is-parent is-vertical is-4 game-servers">
    <div
      v-for="(g, index) in games"
      :key="g.game"
      class="game-category"
      :class="{ 'is-open': g.game === openGame }"
      :style="stickyOffsets(index)"
    >
      <button
        class="game-category-header"
        type="button"
        :aria-expanded="g.game === openGame ? 'true' : 'false'"
        @click="toggle(g.game)"
      >
        <img class="game-logo" :src="`/img/games/${g.game}.png`" alt="" />
        <span class="game-label">{{ g.label }}</span>
        <span class="game-summary" :class="{ 'is-empty': !playerTotal(g) }">
          <b-icon icon="account-multiple" size="is-small" />
          <span>{{ playerTotal(g) || 0 }}</span>
        </span>
        <b-icon class="game-chevron" icon="chevron-down" size="is-small" />
      </button>
      <transition
        name="game-collapse"
        @enter="onEnter"
        @after-enter="onSettled"
        @enter-cancelled="onSettled"
        @leave="onLeave"
        @after-leave="onSettled"
        @leave-cancelled="onSettled"
      >
        <div v-show="g.game === openGame" class="game-category-body">
          <div class="game-category-cards">
            <ServerCard
              v-for="entry in g.entries"
              :key="entry.key"
              :entry="entry"
              :game="g.game"
              tabindex="0"
            />
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<style lang="scss">
.game-servers {
  // Sticky headers park against each other, so both the row height and the gap
  // between rows have to be known quantities rather than whatever the content
  // works out to.
  --header-height: 2.75rem;
  --stack-gap: 1rem;
  // Negated up front. postcss-values-parser, which postcss-preset-env runs in
  // the production build only, cannot parse an operator followed by a negative
  // literal — `calc(var(--x) * -1)` fails there but builds fine in dev.
  --stack-gap-negative: -1rem;
  --half-gap-negative: -0.5rem;
  --band-bleed: 0.75rem;
  --band-bleed-negative: -0.75rem;
  --stack-inset: 1rem;

  display: flex;
  flex-direction: column;
  gap: var(--stack-gap);

  // Matches the surface of .card in _overrides: same fill, radius, glow and
  // purple hover as every other clickable card on the page.
  .game-category-header {
    display: flex;
    align-items: center;
    gap: 0.5em;
    width: 100%;
    height: var(--header-height);
    padding: 0 1em;
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

  // A collapsed category is nothing but its header, so it has no room to slide
  // within itself — the whole category sticks, against .game-servers.
  .game-category:not(.is-open) {
    position: sticky;
    top: var(--sticky-top);
    bottom: var(--sticky-bottom);
    z-index: 3;

    // The band of page background that hides whatever scrolls under the row. It
    // is painted behind the row instead of being padding on it, so the row keeps
    // its full width and the layout is untouched. It bleeds past the row on
    // every side, because a card's shadow reaches about 6px beyond the card and
    // would otherwise show at the edges of the strip.
    //
    // Upward it reaches a full gap, which is exactly the bottom edge of whatever
    // sits above — no sliver of scrolling content between the two, and no
    // overlap onto the card in normal flow.

    &::before {
      content: "";
      position: absolute;
      z-index: -1;
      inset: var(--stack-gap-negative) var(--band-bleed-negative) var(--half-gap-negative);
      // Fades in over the gap it reaches into, so the strip's top edge does not
      // cut across a card. That gap is bare page background in normal flow, so
      // the fade is invisible there. Eased rather than linear: the fade only
      // spans one gap, and a straight ramp steps more visibly over it.
      background: linear-gradient(
        to bottom,
        rgba($body-background-color, 0) 0,
        rgba($body-background-color, 0.016) calc(var(--stack-gap) * 0.125),
        rgba($body-background-color, 0.063) calc(var(--stack-gap) * 0.25),
        rgba($body-background-color, 0.141) calc(var(--stack-gap) * 0.375),
        rgba($body-background-color, 0.25) calc(var(--stack-gap) * 0.5),
        rgba($body-background-color, 0.391) calc(var(--stack-gap) * 0.625),
        rgba($body-background-color, 0.563) calc(var(--stack-gap) * 0.75),
        rgba($body-background-color, 0.766) calc(var(--stack-gap) * 0.875),
        $body-background-color var(--stack-gap)
      );
    }
  }

  // Rows after the first meet the band of the row above them, so they only need
  // to reach half a gap up.
  .game-category:not(.is-open) + .game-category:not(.is-open)::before {
    top: var(--half-gap-negative);
    background: $body-background-color;
  }

  // The bottom row floats clear of the viewport edge, so its band has to reach
  // past that edge — otherwise a sliver of scrolling card shows under the strip.
  .game-category:not(.is-open):last-child::before {
    bottom: calc(var(--stack-gap-negative) - var(--stack-inset));
  }

  // An open one is tall enough to scroll through, so only its header sticks.
  .game-category.is-open .game-category-header {
    position: sticky;
    top: var(--sticky-top);
    z-index: 3;
  }

  .game-category-cards {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding-top: 0.5rem;

    .server-card .playerlist {
      max-height: 10rem;
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
    // Each header parks clear of the ones above it and the ones below it, so
    // they tile instead of piling up on the same edge.
    stickyOffsets(index) {
      const step = "(var(--header-height) + var(--stack-gap))";
      return {
        "--sticky-top": `calc(${index} * ${step})`,
        "--sticky-bottom": `calc(${this.games.length - 1 - index} * ${step} + var(--stack-inset))`,
      };
    },
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
