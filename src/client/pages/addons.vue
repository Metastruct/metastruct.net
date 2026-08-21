<template lang="pug">
#addons
  section.section
    .container
      h1.title Add-ons
      p.subtitle.is-6.muted
        | Everything running on our servers right now, straight from the servers themselves.
      b-message(v-if="error", type="is-warning", has-icon) {{ error }}
      b-message(v-else-if="!servers.length", type="is-info", has-icon)
        | No server has published its add-on list yet.

      .tabs.is-toggle.server-tabs(v-if="servers.length > 1")
        ul
          li(
            v-for="s in servers",
            :key="serverKey(s)",
            :class="{ 'is-active': serverKey(s) === selectedKey }"
          )
            a(:href="'?server=' + serverKey(s)", @click.prevent="select(s)")
              b-icon(:icon="gameIcon(s.game)", size="is-small")
              span {{ s.serverName }}
              span.count {{ s.addons.length }}

      .server(v-if="server", :key="serverKey(server)")
        .server-header
          h2.title.is-4
            b-icon(:icon="gameIcon(server.game)", size="is-small")
            span {{ server.serverName }}
          b-tag(:class="gameClass(server.game)", rounded) {{ gameLabel(server.game) }}
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
                      img(v-if="addon.thumbnail", :src="addon.thumbnail", loading="lazy", alt="")
                      .placeholder(v-else)
                        b-icon(:icon="sourceIcon(addon)")
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
                      b-tag(v-if="addon.version", size="is-small") {{ addon.version }}
                p.addon-description(v-if="addon.description") {{ short(addon.description) }}
                p.addon-description.muted(v-else-if="addon.private") Private, no public source.
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

    a {
      gap: 0.4em;
    }

    .count {
      font-size: 0.75rem;
      opacity: 0.6;
    }
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

    .image img,
    .placeholder {
      border-radius: 6px;
      object-fit: cover;
      width: 48px;
      height: 48px;
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
  gmod: { label: "Garry's Mod", icon: "gamepad-variant", class: "is-primary" },
  minecraft: { label: "Minecraft", icon: "cube-outline", class: "is-success" },
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

export default {
  async asyncData({ app }) {
    try {
      const { data } = await app.$axios.get("/api/v1/addons");
      return { servers: data.servers || [], error: null };
    } catch (err) {
      console.error(err);
      return { servers: [], error: "The add-on list is unavailable right now." };
    }
  },
  data() {
    return { servers: [], error: null, search: "" };
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
    filteredAddons() {
      if (!this.server) return [];
      const terms = this.search.toLowerCase().split(/\s+/).filter(Boolean);
      if (!terms.length) return this.server.addons;
      return this.server.addons.filter(addon => {
        const haystack = [addon.name, addon.description, addon.version, this.sourceLabel(addon)]
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
  },
  methods: {
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
    gameIcon(game) {
      return (GAMES[game] || { icon: "server" }).icon;
    },
    gameClass(game) {
      return (GAMES[game] || { class: "is-light" }).class;
    },
    sourceKey(addon) {
      if (addon.private) return "private";
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
      return SOURCES[this.sourceKey(addon)].icon;
    },
    addonUrl(addon) {
      if (addon.private) return null;
      return addon.source.url || null;
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
