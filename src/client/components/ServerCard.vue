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
          span &nbsp;on&nbsp;
          span.small-code {{ entry.map }}
        span.small-code.mode(v-if="entry.mode") {{ entry.mode }}
      .subtitle(v-if="uptime") {{ uptime }} uptime
      .subtitle.extra(v-if="extraLine") {{ extraLine }}
    ul.playerlist(v-if="entry.players.length > 0", @mousedown.stop, @mouseup.stop)
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
        :title="copied ? 'Copied!' : 'Copy server address'",
        @click.prevent="copyAddress"
      )
        span.small-code {{ address }}
        b-icon(:icon="copied ? 'check' : 'content-copy'", size="is-small")
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
    clip-path: inset(0px 0px 0px 0px);

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
      filter: brightness(125%) blur(0px);
      margin: -8px;
    }
  }

  .card-content {
    display: flex;
    flex-direction: column;
    height: 100%;

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
      padding: 0.75em;
      background: rgba($grey-darker, 0.36);
      max-height: 184px;
      overflow-y: auto;
      color: $light;
      align-content: center;

      .player {
        width: 100%;
        display: flex;
        align-items: center;

        > a,
        > span {
          text-decoration: none;
          display: flex;
          align-items: center;
          min-width: 0;
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

        &:not(:last-child) {
          margin-bottom: 0.25em;
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
      font-size: 1.5em;
      margin-top: 1.5rem;

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
const DEFAULT_BACKGROUND = "/img/gm_construct_m.jpg";

export default {
  props: {
    entry: { type: Object, required: true },
    game: { type: String, required: true },
  },
  data() {
    return { mX: null, mY: null, copied: false, now: Date.now() };
  },
  computed: {
    playerCount() {
      const count = this.entry.playerCount;
      if (!count) return "Empty,";
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
      return this.connect.address || null;
    },
    joinUrl() {
      if (this.game === "gmod") {
        if (this.connect.label) return `/join/${this.connect.label}`;
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
      const image = this.entry.thumbnail || DEFAULT_BACKGROUND;
      return {
        backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("${image}")`,
      };
    },
  },
  mounted() {
    this.timer = setInterval(() => {
      this.now = Date.now();
    }, 60000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
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
