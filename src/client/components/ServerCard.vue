<template lang="pug">
.card.server-card(@mousedown="startJoin", @mouseup="endJoin")
  .background-container
    .background(:style="backgroundStyle")
  .card-content
    p.title.has-text-primary-light {{ entry.name }}
    .subtitle
      .summary
        span {{ playerCount }}
        template(v-if="entry.map")
          span {{ entry.playerCount ? "" : "," }}&nbsp;on&nbsp;
          span.small-code {{ entry.map }}
        span.small-code.mode(v-if="entry.mode") {{ entry.mode }}
      .subtitle(v-if="uptime") {{ uptime }} uptime
      .subtitle.extra(v-if="extraLine") {{ extraLine }}
      .subtitle.extra(v-if="address")
        span.small-code {{ address }}
    ul.playerlist(
      v-if="entry.players.length > 0",
      ref="playerlist",
      :class="{ 'is-two-columns': twoColumns }",
      @mousedown.stop,
      @mouseup.stop
    )
      li.player(
        v-for="player in entry.players",
        :key="player.id || player.nick",
        :class="{ 'is-admin': player.isAdmin, 'is-afk': player.isAfk }"
      )
        component(
          :is="player.profileUrl ? 'a' : 'span'",
          :href="player.profileUrl",
          :title="player.profileUrl ? 'View profile' : undefined",
          target="_blank",
          rel="noopener"
        )
          img.avatar(v-if="player.avatar", :src="player.avatar", alt="")
          span.nick {{ player.nick }}
          span.description(v-if="player.description") &nbsp;{{ player.description }}
        a.join-goto(
          v-if="goToUrl(player)",
          :title="'Join and go to ' + player.nick",
          :href="goToUrl(player)"
        )
          b-icon(icon="arrow-right", type="is-success")
    .server-card-bottom(@mousedown.stop, @mouseup.stop)
      a.has-text-primary-light(v-if="joinUrl", :href="joinUrl", :target="joinTarget") Join us!
      a.has-text-primary-light.copy-address(
        v-else-if="address",
        :title="'Copy ' + address",
        @click.prevent="copyAddress"
      )
        span(v-if="copied") Copied {{ address }}
        span(v-else) Join us!
</template>

<style lang="scss">
.card.server-card {
  cursor: pointer;
  position: relative;
  z-index: 0;

  .background-container {
    position: absolute;
    z-index: -1;
    left: 0;
    right: 0;
    top: 0;
    height: calc(100% + 1px);
    clip-path: inset(0px 0px 0px 0px round 4px);

    .background {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      background-size: cover;
      background-position: center center;
      filter: brightness(100%) blur(3px);
      transform-origin: center;
      transition: margin 0.25s ease-out, filter 0.25s ease-out;
    }
  }

  &:hover,
  &:active,
  &:focus {
    .background {
      filter: brightness(115%) blur(3px);
      margin: -8px;
    }
  }

  .card-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 1em;

    .title {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      margin-bottom: 0.5rem;
    }

    .title + .subtitle {
      margin-top: 0;
    }

    .summary {
      display: flex;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 0 0.5em;
    }

    .extra {
      font-size: 0.85em;
      opacity: 0.8;
    }

    .playerlist {
      cursor: default;
      margin: auto 0;
      padding: 0;
      border-radius: 4px;
      background: rgba($grey-darker, 0.36);
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      color: $light;
      // `safe` falls back to start alignment once the list overflows; plain
      // centring puts the first rows above the scroll origin, out of reach.
      align-content: center;
      align-content: safe center;

      &.is-two-columns {
        display: grid;
        grid-template-columns: 1fr 1fr;

        // stripe by row, not by index, so both columns of a row match
        .player:nth-child(4n + 1),
        .player:nth-child(4n + 2) {
          background: rgba($grey-darker, 0.45);
        }

        .player:nth-child(4n + 3),
        .player:nth-child(4n + 4) {
          background: rgba($white, 0.04);
        }
      }

      &:not(.is-two-columns) {
        .player:nth-child(odd) {
          background: rgba($grey-darker, 0.45);
        }

        .player:nth-child(even) {
          background: rgba($white, 0.04);
        }
      }

      .player {
        width: 100%;
        display: flex;
        align-items: center;
        padding: 0.2em 0.6em;
        min-height: 26px;

        > a,
        > span {
          text-decoration: none;
          display: flex;
          align-items: center;
          min-width: 0;
          flex: 1;
        }

        > a:hover,
        > a:active,
        > a:focus {
          filter: brightness(75%);
        }

        .nick {
          display: inline-block;
          font-size: 0.9em;
          color: $info;
          white-space: nowrap;
          flex: none;
        }

        .description {
          font-size: 0.8em;
          opacity: 0.6;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          min-width: 0;
        }

        .avatar {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          margin-right: 0.33em;
          flex: none;
        }

        &.is-admin .nick {
          color: lighten(adjust-hue($info, 80), 5%) !important;
        }

        &.is-afk {
          opacity: 0.5;
        }

        .join-goto {
          margin-left: auto;
        }
      }
    }

    .small-code {
      font-size: 11pt;
      font-family: monospace;
      font-weight: 400;
    }

    .mode {
      --x-padding: 3px;
      --height: 24px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      height: var(--height);
      border-radius: calc(var(--height) + var(--x-padding));
      padding: 3px 6px;
      background: linear-gradient(225deg, hsl(25, 88%, 40%) 0%, hsl(25, 88%, 30%) 100%);
      color: white;
      font-size: 9pt;
      white-space: nowrap;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .server-card-bottom {
      display: flex;
      justify-content: space-around;
      font-size: 1.1em;
      margin-top: 1rem;

      .copy-address {
        display: inline-flex;
        align-items: center;
        gap: 0.4em;
        cursor: copy;
      }
    }

    .subtitle + .server-card-bottom {
      // In case playerlist does not show up
      margin-top: auto !important;
    }
  }
}
</style>

<script>
// Per-game fallback when the API has no thumbnail for an entry. Games without
// one get a gradient with their logo as a watermark.
const DEFAULT_BACKGROUNDS = {
  gmod: "/img/gm_construct_m.jpg",
  minecraft: "/img/minecraft_trial_chambers.jpg",
  ss13: "/img/ss13_bubberstation.jpg",
};

export default {
  props: {
    entry: { type: Object, required: true },
    game: { type: String, required: true },
  },
  data() {
    return { mX: null, mY: null, copied: false, now: Date.now(), twoColumns: false };
  },
  computed: {
    playerCount() {
      const count = this.entry.playerCount;
      if (!count) return "Empty";
      const max = this.entry.maxPlayers ? `/${this.entry.maxPlayers}` : "";
      return `${count}${max} player${count !== 1 || max ? "s" : ""}`;
    },
    uptime() {
      if (!this.entry.upSince) return null;
      const hours = (this.now - this.entry.upSince) / 3600000;
      if (hours < 0) return null;
      return `${hours.toFixed(1)} hours`;
    },
    extraLine() {
      const extra = this.entry.extra;
      if (!extra) return null;
      const parts = [];
      if (extra.status) parts.push(extra.status);
      if (extra.version) parts.push(extra.version);
      if (extra.round) parts.push(`round ${extra.round}`);
      if (extra.securityLevel) parts.push(`${extra.securityLevel} alert`);
      if (extra.shuttle && extra.shuttle !== "idle") parts.push(`shuttle ${extra.shuttle}`);
      return parts.join(", ") || null;
    },
    connect() {
      return this.entry.connect || {};
    },
    address() {
      if (this.game !== "minecraft") return null;
      const address = this.connect.address || null;
      return address && !/^[a-z]+:\/\//i.test(address) ? address : null;
    },
    joinUrl() {
      if (this.game === "minecraft") {
        const address = this.connect.address;
        return address && /^[a-z]+:\/\//i.test(address) ? address : null;
      }
      if (this.game === "gmod") {
        if (this.connect.label) return `${this.$config.metaconcordUrl}/join/${this.connect.label}`;
        const host = this.connect.ip || this.connect.address;
        if (host && this.connect.port)
          return `steam://connect/${host}:${this.connect.port}/metaweb`;
        return null;
      }
      return this.connect.url || null;
    },
    joinTarget() {
      return this.joinUrl && /^https?:/.test(this.joinUrl) ? "_blank" : undefined;
    },
    backgroundStyle() {
      const image = this.entry.thumbnail || DEFAULT_BACKGROUNDS[this.game];
      if (image) {
        return {
          backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("${image}")`,
        };
      }
      return { backgroundColor: "#111" };
    },
  },
  watch: {
    "entry.players.length"() {
      this.$nextTick(this.updateColumns);
    },
  },
  mounted() {
    this.timer = setInterval(() => {
      this.now = Date.now();
    }, 60000);
    if (typeof ResizeObserver !== "undefined") {
      this.observer = new ResizeObserver(() => this.updateColumns());
      this.observer.observe(this.$el);
    }
    this.updateColumns();
  },
  beforeDestroy() {
    clearInterval(this.timer);
    if (this.observer) this.observer.disconnect();
  },
  methods: {
    // Two columns only when a single column would overflow the space the list
    // gets from the card by more than a quarter; a little scrolling beats
    // wasting half the list on a short second column.
    updateColumns() {
      const list = this.$refs.playerlist;
      if (!list) return;
      const rows = this.entry.players.length;
      const row = list.querySelector(".player");
      const rowHeight = row ? row.getBoundingClientRect().height : 26;
      const style = getComputedStyle(list);
      const available =
        list.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
      this.twoColumns = rows > 1 && rows * rowHeight > available * 1.25;
    },
    goToUrl(player) {
      if (this.game !== "gmod" || player.entIndex === undefined) return null;
      const host = this.connect.ip || this.connect.address;
      if (!host || !this.connect.port) return null;
      return `steam://connect/${host}:${this.connect.port}/GO:_${player.entIndex}`;
    },
    startJoin(ev) {
      [this.mX, this.mY] = [ev.x, ev.y];
    },
    endJoin(ev) {
      if (ev.button !== 0) return; // Only handle left click
      if (this.mX - ev.x !== 0 || this.mY - ev.y !== 0) return;
      if (this.joinUrl) window.open(this.joinUrl, this.joinTarget || "_self");
      else if (this.address) this.copyAddress();
    },
    async copyAddress() {
      try {
        await navigator.clipboard.writeText(this.address);
        this.copied = true;
        setTimeout(() => (this.copied = false), 1500);
      } catch (err) {
        console.error(err);
      }
    },
  },
};
</script>
