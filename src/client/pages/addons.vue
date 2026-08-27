<template lang="pug">
#addons
  section.section
    .container
      h1.title Add-ons
      p.subtitle.is-6.muted
        | Everything running on our servers right now, straight from the servers themselves.
      b-message(v-if="error", type="is-warning", has-icon) {{ error }}
      b-message(v-else-if="!loading && !servers.length", type="is-info", has-icon)
        | No server has published its add-on list yet.

      .tabs.is-toggle.toggle-tabs.server-tabs(v-if="servers.length > 1")
        ul
          li(
            v-for="s in servers",
            :key="serverKey(s)",
            :class="{ 'is-active': serverKey(s) === selectedKey }"
          )
            a(:href="'?server=' + serverKey(s)", @click.prevent="select(s)")
              img.game-logo(:src="gameLogo(s.game)", :alt="gameLabel(s.game)", :title="gameLabel(s.game)")
              span {{ s.serverName }}

      .server(v-if="server", :key="serverKey(server)")
        .server-header
          h2.title.is-4
            img.game-logo(
              :src="gameLogo(server.game)",
              :alt="gameLabel(server.game)",
              :title="gameLabel(server.game)"
            )
            span {{ server.serverName }}
          span.is-size-7.muted {{ server.addons.length }} add-ons, updated {{ relative(server.updatedAt) }}
          b-input.search(
            v-model="search",
            type="search",
            icon="magnify",
            placeholder="Search add-ons",
            icon-right="close-circle",
            icon-right-clickable,
            @icon-right-click="search = ''"
          )
        .card.mounted-games(v-if="mountedGames.length")
          .card-content
            h3.is-size-6.has-text-weight-semibold Mounted games

            .tags
              b-tag(
                v-for="game in mountedGames",
                :key="game.folder",
                size="is-small",
                :class="game.required ? 'is-warning' : ''"
              )
                | {{ game.label }}
                span.required-note(v-if="game.required")  &middot; required
        p.muted(v-if="search && !filteredAddons.length") Nothing matches "{{ search }}".
        .columns.is-multiline
          .column.is-one-quarter-desktop.is-half-tablet(
            v-for="addon in filteredAddons",
            :key="addon.key || addon.name"
          )
            .card.addon(:class="{ 'is-private': addon.private }")
              .card-content
                .media
                  .media-left
                    figure.image.is-48x48
                      img(
                        v-if="thumbnail(addon)",
                        :src="thumbnail(addon)",
                        loading="lazy",
                        alt="",
                        @error="dropThumbnail(addon)"
                      )
                      .placeholder(v-else)
                        b-icon(:icon="sourceIcon(addon)")
                      .lock-badge(v-if="addon.private && thumbnail(addon)", title="Private")
                        b-icon(icon="lock", size="is-small")
                  .media-content
                    a.addon-name.has-text-primary(
                      v-if="addonUrl(addon)",
                      :href="addonUrl(addon)",
                      target="_blank",
                      rel="noopener"
                    ) {{ addon.name }}
                    span.addon-name(v-else) {{ addon.name }}
                    .tags
                      b-tag(size="is-small", :class="sourceClass(addon)") {{ sourceLabel(addon) }}
                      b-tag(v-if="branchOf(addon)", size="is-small") {{ branchOf(addon) }}
                      b-tag(v-if="addon.version", size="is-small") {{ addon.version }}
                p.addon-description(v-if="addon.description") {{ short(addon.description) }}
                p.addon-description.muted(v-else-if="addon.private && !addonUrl(addon)") Private, no public source.
                p.addon-description.muted(v-else) No description provided.
                a.is-size-7.repo-link(
                  v-if="repoUrl(addon)",
                  :href="repoUrl(addon)",
                  target="_blank",
                  rel="noopener"
                ) source repository
</template>

<style lang="scss">
#addons {
  .muted {
    color: rgba(254, 254, 254, 0.55) !important;
  }

  .server-tabs {
    margin-top: 1.5rem;
    margin-bottom: 0;
  }

  .game-logo {
    width: 1.25em;
    height: 1.25em;
    border-radius: 3px;
    flex: none;
  }

  .server {
    margin-top: 2rem;

    .server-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;

      .title {
        margin-bottom: 0;
        display: inline-flex;
        align-items: center;
        gap: 0.4em;
      }

      .search {
        margin-left: auto;
        width: 16rem;
        max-width: 100%;
      }
    }
  }

  .card.mounted-games {
    margin-bottom: 1.5rem;

    .card-content {
      padding: 0.9em 1em;
    }

    p {
      margin-bottom: 0.6em;
    }

    .tags {
      margin-bottom: 0;
    }

    .required-note {
      opacity: 0.75;
    }
  }

  .card.addon {
    // Fixed height so every card lines up regardless of description length.
    height: 12.5rem;
    display: flex;
    flex-direction: column;

    &.is-private {
      opacity: 0.7;
    }

    .card-content {
      padding: 0.75em;
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
    }

    .repo-link {
      margin-top: auto;
      padding-top: 0.25em;
    }

    .media {
      margin-bottom: 0.5em;
    }

    .image {
      position: relative;
    }

    .image img,
    .placeholder {
      border-radius: 6px;
      object-fit: cover;
      width: 48px;
      height: 48px;
    }

    // private add-ons keep the lock even when they have a picture to show
    .lock-badge {
      position: absolute;
      right: -3px;
      bottom: -3px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #1a1a1a;
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.25);
      color: rgba(255, 255, 255, 0.85);

      .icon {
        width: 12px;
        height: 12px;
        font-size: 12px;
      }
    }

    .placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.5);
    }

    .addon-name {
      font-weight: 600;
      display: block;
      overflow-wrap: anywhere;
    }

    .tags {
      margin-top: 0.25em;
      margin-bottom: 0;
    }

    .addon-description {
      font-size: 0.85rem;
      white-space: pre-line;
      overflow-wrap: anywhere;
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 4;
    }
  }
}
</style>

<script>
const GAMES = {
  gmod: { label: "Garry's Mod", logo: "/img/games/gmod.png" },
  minecraft: { label: "Minecraft", logo: "/img/games/minecraft.png" },
};

const SOURCES = {
  workshop: { label: "Workshop", icon: "steam", class: "is-info" },
  github: { label: "GitHub", icon: "github", class: "is-dark" },
  gitlab: { label: "GitLab", icon: "gitlab", class: "is-warning" },
  git: { label: "Git", icon: "git", class: "is-dark" },
  modrinth: { label: "Modrinth", icon: "cube", class: "is-success" },
  curseforge: { label: "CurseForge", icon: "fire", class: "is-danger" },
  website: { label: "Website", icon: "web", class: "" },
  private: { label: "Private", icon: "lock", class: "" },
  unknown: { label: "Unknown", icon: "help-circle-outline", class: "" },
};

// Half-Life 2, its episodes and Counter-Strike: Source ship their assets with the
// base game now, so listing them tells nobody anything they need to act on.
const CONTENT_HIDDEN = ["garrysmod", "episodic", "ep2", "cstrike"];
// listed whether or not a server reports it, so this one carries its own name
const CONTENT_REQUIRED = [{ folder: "tf", title: "Team Fortress 2" }];

export default {
  data() {
    return { servers: [], error: null, search: "", loading: true, brokenThumbnails: [] };
  },
  head() {
    return {
      title: "Add-ons - Meta Construct",
    };
  },
  computed: {
    selectedKey() {
      const wanted = this.$route.query.server;
      const match = this.servers.find(s => this.serverKey(s) === wanted);
      return match ? wanted : this.servers.length ? this.serverKey(this.servers[0]) : null;
    },
    server() {
      return this.servers.find(s => this.serverKey(s) === this.selectedKey) || null;
    },
    mountedGames() {
      if (!this.server || !this.server.games) return [];
      const shown = this.server.games.filter(g => !CONTENT_HIDDEN.includes(g.folder));
      for (const game of CONTENT_REQUIRED) {
        if (!shown.some(g => g.folder === game.folder)) shown.push(game);
      }
      return shown
        .map(g => ({
          folder: g.folder,
          label: g.title || g.folder,
          required: CONTENT_REQUIRED.some(r => r.folder === g.folder),
        }))
        .sort((a, b) => b.required - a.required || a.label.localeCompare(b.label));
    },
    filteredAddons() {
      if (!this.server) return [];
      const terms = this.search.toLowerCase().split(/\s+/).filter(Boolean);
      if (!terms.length) return this.server.addons;
      return this.server.addons.filter(addon => {
        const haystack = [
          addon.name,
          addon.description,
          addon.version,
          this.branchOf(addon),
          this.sourceLabel(addon),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return terms.every(term => haystack.includes(term));
      });
    },
  },
  watch: {
    selectedKey() {
      this.search = "";
    },
    // The sources of private repos only come back for a logged in team member, so
    // the request waits until /auth/me has said whether there is a session.
    "$store.state.userLoaded"(loaded) {
      if (loaded) this.load();
    },
  },
  mounted() {
    if (this.$store.state.userLoaded) this.load();
  },
  methods: {
    async load() {
      try {
        const { data } = await this.$axios.get(`${this.$config.metaconcordUrl}/addons`);
        this.servers = data.servers || [];
      } catch (err) {
        console.error(err);
        this.error = "The add-on list is unavailable right now.";
      }
      this.loading = false;
    },
    serverKey(server) {
      return `${server.game}-${server.serverId}`;
    },
    select(server) {
      const key = this.serverKey(server);
      if (key === this.selectedKey) return;
      this.$router.replace({ query: { ...this.$route.query, server: key } });
    },
    gameLabel(game) {
      return (GAMES[game] || { label: game }).label;
    },
    gameLogo(game) {
      return (GAMES[game] || { logo: "/img/logo.png" }).logo;
    },
    sourceKey(addon) {
      // A private addon whose source came back (team members only) shows its real host.
      if (addon.private && !addon.source.url) return "private";
      const { source } = addon;
      if (source.kind === "git") return SOURCES[source.host] ? source.host : "git";
      return SOURCES[source.kind] ? source.kind : "unknown";
    },
    sourceLabel(addon) {
      return SOURCES[this.sourceKey(addon)].label;
    },
    sourceClass(addon) {
      return SOURCES[this.sourceKey(addon)].class;
    },
    sourceIcon(addon) {
      // The thumbnail keeps the lock even once the host chip replaced the private one.
      return addon.private ? "lock" : SOURCES[this.sourceKey(addon)].icon;
    },
    addonUrl(addon) {
      return addon.source.url || null;
    },
    // a private repo avatar can be unreadable to the browser even when the API served it
    thumbnail(addon) {
      if (!addon.thumbnail) return null;
      return this.brokenThumbnails.includes(addon.thumbnail) ? null : addon.thumbnail;
    },
    dropThumbnail(addon) {
      if (addon.thumbnail && !this.brokenThumbnails.includes(addon.thumbnail)) {
        this.brokenThumbnails.push(addon.thumbnail);
      }
    },
    branchOf(addon) {
      return addon.source.kind === "git" ? addon.source.branch || null : null;
    },
    repoUrl(addon) {
      return addon.source.kind === "workshop" ? addon.source.repoUrl || null : null;
    },
    short(text) {
      const clean = text.replace(/\[\/?[a-z*]+[^\]]*\]/gi, "").trim();
      return clean.length > 300 ? clean.slice(0, 297) + "..." : clean;
    },
    relative(ts) {
      const minutes = Math.round((Date.now() - ts) / 60000);
      if (minutes < 1) return "just now";
      if (minutes < 60) return `${minutes} min ago`;
      const hours = Math.round(minutes / 60);
      if (hours < 48) return `${hours} h ago`;
      return `${Math.round(hours / 24)} days ago`;
    },
  },
};
</script>
