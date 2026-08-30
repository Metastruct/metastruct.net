<template>
  <div id="bans">
    <section class="section">
      <div class="container">
        <div class="appeal-callout">
          <div>
            <strong>Banned?</strong>
            <span class="callout-text">You can appeal your ban and talk to the developers.</span>
          </div>
          <NuxtLink to="/appeal" class="button is-link is-small">Ban appeal</NuxtLink>
        </div>

        <h1 class="title">Bans</h1>
        <p class="subtitle is-6 muted">
          Our records of naughty people for our Garry's Mod servers.
        </p>

        <MessageBox v-if="error" type="is-warning" has-icon>{{ error }}</MessageBox>
        <MessageBox v-else-if="stale" type="is-warning" has-icon>
          This list may be out of date.
        </MessageBox>

        <div v-if="!error" class="bans-header">
          <div class="tabs is-toggle toggle-tabs status-tabs">
            <ul>
              <li v-for="s in STATUSES" :key="s.key" :class="{ 'is-active': s.key === status }">
                <a :href="'?status=' + s.key" @click.prevent="setQuery({ status: s.key })">
                  <span>{{ s.label }}</span>
                  <span v-if="loaded" class="count">&nbsp;{{ counts[s.key] }}</span>
                </a>
              </li>
            </ul>
          </div>

          <FormSelect v-model="gamemodeFilter" class="gamemode">
            <option value="any">Any gamemode</option>
            <option value="global">Global only</option>
            <option v-for="g in gamemodes" :key="g" :value="g">{{ g }}</option>
          </FormSelect>

          <FormInput
            v-model="search"
            class="search"
            type="search"
            icon="magnify"
            placeholder="Search name, SteamID, reason"
            icon-right="close-circle"
            icon-right-clickable
            @icon-right-click="search = ''"
          />

          <client-only>
            <button v-if="canModerate" class="button is-danger is-small new-ban" @click="openBan()">
              <MdiIcon icon="gavel" size="is-small" />
              <span>&nbsp;New ban</span>
            </button>
          </client-only>
        </div>

        <p v-if="!error && loaded" class="is-size-7 muted updated">
          <span>Updated {{ relative(updatedAt) }}</span>
          <button
            class="button is-small is-text refresh"
            :class="{ 'is-loading': loading }"
            :disabled="loading"
            @click="load(true)"
          >
            refresh
          </button>
        </p>

        <MessageBox v-if="!loading && !error && !bans.length" type="is-info" has-icon>
          No bans have been recorded yet.
        </MessageBox>

        <div ref="wrap" class="table-wrap">
          <LoadingOverlay :full-page="false" :active="loading" />
          <table
            v-if="bans.length"
            ref="table"
            class="table is-fullwidth ban-table"
            :class="tier ? `is-${tier}` : null"
          >
            <thead>
              <tr>
                <th
                  v-for="column in COLUMNS"
                  :key="column.label"
                  :class="{ 'is-sortable': column.field, 'is-sorted': column.field === sortField }"
                  @click="column.field && toggleSort(column.field)"
                >
                  {{ column.label }}
                  <MdiIcon
                    v-if="column.field === sortField"
                    :icon="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                    size="is-small"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-for="ban in sortedBans" :key="ban.id">
                <tr
                  :class="[rowClass(ban), { 'is-expanded': expandedId === ban.id }]"
                  @click="toggleRow(ban, $event)"
                >
                  <td class="player-cell">
                    <div class="player">
                      <img
                        v-if="avatarOf(ban) && !broken.includes(avatarOf(ban))"
                        class="avatar"
                        :src="avatarOf(ban)"
                        loading="lazy"
                        alt=""
                        @error="broken.push(avatarOf(ban))"
                      >
                      <div v-else class="avatar placeholder">
                        <MdiIcon icon="account" size="is-small" />
                      </div>
                      <div class="names">
                        <span class="nick">{{ ban.name || "???" }}</span>
                        <span v-if="personaOf(ban)" class="persona">{{ personaOf(ban) }}</span>
                      </div>
                    </div>
                    <MdiIcon class="expand-chevron" icon="chevron-down" size="is-small" />
                  </td>
                  <td>
                    <a
                      v-if="ban.steamId64"
                      class="steamid"
                      :href="'https://steamcommunity.com/profiles/' + ban.steamId64"
                      target="_blank"
                      rel="noopener"
                      >{{ ban.steamId }}</a
                    >
                    <span v-else class="steamid">{{ ban.steamId }}</span>
                    <MdiIcon class="expand-chevron" icon="chevron-down" size="is-small" />
                  </td>
                  <td>
                    <span class="tag" :class="statusOf(ban).type">{{ statusOf(ban).label }}</span>
                  </td>
                  <td>
                    <span class="reason" :title="ban.reason">{{
                      ban.reason || "no reason given"
                    }}</span>
                  </td>
                  <td>
                    <span v-if="ban.gamemode" class="tag is-dark">{{ ban.gamemode }}</span>
                    <span v-else class="tag is-dark">GLOBAL</span>
                  </td>
                  <td>
                    <div class="actor">
                      <MdiIcon
                        class="platform"
                        :icon="actorInfo(ban.bannedBy).icon"
                        size="is-small"
                      />
                      <a
                        v-if="actorInfo(ban.bannedBy).url"
                        :href="actorInfo(ban.bannedBy).url"
                        target="_blank"
                        rel="noopener"
                        >{{ actorInfo(ban.bannedBy).label }}</a
                      >
                      <span v-else>{{ actorInfo(ban.bannedBy).label }}</span>
                    </div>
                  </td>
                  <td>
                    <span :title="absolute(ban.bannedAt)">{{ day(ban.bannedAt) }}</span>
                  </td>
                  <td>
                    <span v-if="ban.permanent" class="permanent">permanent</span>
                    <span v-else :title="absolute(ban.unbanAt)">{{ until(ban.unbanAt) }}</span>
                  </td>
                  <td class="actions-cell">
                    <client-only>
                      <button
                        v-if="canModerate && ban.active && !ban.permanent"
                        class="button is-small"
                        @click="openEdit(ban)"
                      >
                        <MdiIcon icon="pencil" size="is-small" />
                        <span>&nbsp;Edit</span>
                      </button>
                    </client-only>
                  </td>
                </tr>
                <tr v-if="expandedId === ban.id" class="ban-detail">
                  <td :colspan="COLUMNS.length">
                    <dl>
                      <div class="detail-steamid">
                        <dt>SteamID</dt>
                        <dd>
                          <a
                            v-if="ban.steamId64"
                            class="steamid"
                            :href="'https://steamcommunity.com/profiles/' + ban.steamId64"
                            target="_blank"
                            rel="noopener"
                            >{{ ban.steamId }}</a
                          >
                          <span v-else class="steamid">{{ ban.steamId }}</span>
                        </dd>
                      </div>
                      <div>
                        <dt>Status</dt>
                        <dd>
                          <span class="tag" :class="statusOf(ban).type">{{
                            statusOf(ban).label
                          }}</span>
                        </dd>
                      </div>
                      <div>
                        <dt>Reason</dt>
                        <dd>{{ ban.reason || "no reason given" }}</dd>
                      </div>
                      <div>
                        <dt>Gamemode</dt>
                        <dd>
                          <span class="tag is-dark">{{ ban.gamemode || "GLOBAL" }}</span>
                        </dd>
                      </div>
                      <div>
                        <dt>By</dt>
                        <dd>
                          <div class="actor">
                            <MdiIcon
                              class="platform"
                              :icon="actorInfo(ban.bannedBy).icon"
                              size="is-small"
                            />
                            <a
                              v-if="actorInfo(ban.bannedBy).url"
                              :href="actorInfo(ban.bannedBy).url"
                              target="_blank"
                              rel="noopener"
                              >{{ actorInfo(ban.bannedBy).label }}</a
                            >
                            <span v-else>{{ actorInfo(ban.bannedBy).label }}</span>
                          </div>
                        </dd>
                      </div>
                      <div>
                        <dt>Banned</dt>
                        <dd :title="absolute(ban.bannedAt)">{{ day(ban.bannedAt) }}</dd>
                      </div>
                      <div>
                        <dt>Expires</dt>
                        <dd>
                          <span v-if="ban.permanent" class="permanent">permanent</span>
                          <span v-else :title="absolute(ban.unbanAt)">{{
                            until(ban.unbanAt)
                          }}</span>
                        </dd>
                      </div>
                    </dl>
                    <client-only>
                      <button
                        v-if="canModerate && ban.active && !ban.permanent"
                        class="button is-small"
                        @click="openEdit(ban)"
                      >
                        <MdiIcon icon="pencil" size="is-small" />
                        <span>&nbsp;Edit</span>
                      </button>
                    </client-only>
                  </td>
                </tr>
              </template>
              <tr v-if="!sortedBans.length">
                <td :colspan="COLUMNS.length">
                  <div class="empty">
                    <span v-if="search">Nothing matches "{{ search }}"</span>
                    <span v-else>No bans match these filters.</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <client-only>
      <BanCreateModal ref="createModal" @saved="applyBan" />
      <BanEditModal ref="editModal" @saved="applyBan" />
    </client-only>
  </div>
</template>

<script>
import BanCreateModal from "@/components/BanCreateModal.vue";
import BanEditModal from "@/components/BanEditModal.vue";

const STATUSES = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "expired", label: "Expired" },
  { key: "unbanned", label: "Unbanned" },
];
const SORT_FIELDS = ["name", "steamId", "reason", "gamemode", "bannedAt", "unbanAt"];
// field is what the header sorts on, columns without one are not sortable
const COLUMNS = [
  { field: "name", label: "Player" },
  { field: "steamId", label: "SteamID" },
  { field: null, label: "Status" },
  { field: "reason", label: "Reason" },
  { field: "gamemode", label: "Gamemode" },
  { field: null, label: "By" },
  { field: "bannedAt", label: "Banned" },
  { field: "unbanAt", label: "Expires" },
  { field: null, label: "" },
];

export default {
  components: { BanCreateModal, BanEditModal },
  setup() {
    useHead({ title: "Bans - Meta Construct" });
    return useUser();
  },
  data() {
    return {
      STATUSES,
      COLUMNS,
      bans: [],
      profiles: {},
      updatedAt: 0,
      stale: false,
      error: null,
      loading: true,
      loaded: false,
      search: this.$route.query.q || "",
      broken: [],
      // the row opened in the compact layout, where most columns are hidden
      expandedId: null,
      // "", "compact" or "minimal", set by measureFit(). Below the phone breakpoints the
      // stylesheet picks a tier on its own, so this stays "" there and nothing depends on it.
      tier: "",
    };
  },
  computed: {
    canModerate() {
      return (this.user.teams || []).length > 0;
    },
    status() {
      const wanted = this.$route.query.status;
      return STATUSES.some(s => s.key === wanted) ? wanted : "active";
    },
    gamemode() {
      return this.$route.query.gamemode || "any";
    },
    // a plain v-model would fight the route, this keeps the URL the single source of truth
    gamemodeFilter: {
      get() {
        return this.gamemode;
      },
      set(value) {
        this.setQuery({ gamemode: value });
      },
    },
    sortField() {
      const [field] = (this.$route.query.sort || "").split(":");
      return SORT_FIELDS.includes(field) ? field : "bannedAt";
    },
    sortDirection() {
      const [, dir] = (this.$route.query.sort || "").split(":");
      return dir === "asc" ? "asc" : "desc";
    },
    gamemodes() {
      const found = new Set();
      for (const ban of this.bans) if (ban.gamemode) found.add(ban.gamemode);
      return [...found].sort();
    },
    // built once per data load rather than once per keystroke
    haystacks() {
      const map = {};
      for (const ban of this.bans) {
        map[ban.id] = [
          ban.steamId,
          ban.steamId64,
          ban.name,
          this.personaOf(ban),
          ban.reason,
          ban.unbanReason,
          this.actorText(ban.bannedBy),
          this.actorText(ban.unbannedBy),
          ban.gamemode || "global",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
      }
      return map;
    },
    counts() {
      const out = { all: this.bans.length, active: 0, expired: 0, unbanned: 0 };
      for (const ban of this.bans) out[this.statusOf(ban).key]++;
      return out;
    },
    filteredBans() {
      const terms = this.search.toLowerCase().split(/\s+/).filter(Boolean);
      return this.bans.filter(ban => {
        if (this.status !== "all" && this.statusOf(ban).key !== this.status) return false;
        if (this.gamemode === "global" && ban.gamemode) return false;
        if (this.gamemode !== "any" && this.gamemode !== "global" && ban.gamemode !== this.gamemode)
          return false;
        if (!terms.length) return true;
        const haystack = this.haystacks[ban.id] || "";
        return terms.every(term => haystack.includes(term));
      });
    },
    sortedBans() {
      const field = this.sortField;
      const isAsc = this.sortDirection === "asc";
      return [...this.filteredBans].sort(compareBans(field, isAsc));
    },
  },
  watch: {
    search(value) {
      clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => {
        this.setQuery({ q: value || undefined });
      }, 300);
    },
    "$route.query.q"(value) {
      if ((value || "") !== this.search) this.search = value || "";
    },
    // a different set of rows can need a different width
    sortedBans() {
      this.$nextTick(this.measureFit);
    },
  },
  mounted() {
    // the list is the same for everyone, so it does not wait on /auth/me
    this.load();
    this._observer = new ResizeObserver(entries => {
      const width = entries[0].contentRect.width;
      // the class measureFit() toggles changes the table height, which would
      // otherwise bounce straight back into this callback
      if (width === this._lastWidth) return;
      this._lastWidth = width;
      this.measureFit();
    });
    this._observer.observe(this.$refs.wrap);
  },
  beforeUnmount() {
    clearTimeout(this._searchTimer);
    this._observer?.disconnect();
  },
  methods: {
    async load(manual = false) {
      if (manual) this.loading = true;
      try {
        const data = await this.$mc("/bans");
        this.bans = data.bans || [];
        this.profiles = data.profiles || {};
        this.updatedAt = data.updatedAt || 0;
        this.stale = !!data.stale;
        this.error = null;
        this.loaded = true;
      } catch (err) {
        console.error(err);
        this.error = "The ban list is unavailable right now.";
      }
      this.loading = false;
    },
    // the defaults stay out of the URL so a bare /bans is the canonical link
    setQuery(patch) {
      const merged = { ...this.$route.query, ...patch };
      const query = {};
      for (const [key, value] of Object.entries(merged)) {
        if (value === undefined || value === "" || value === null) continue;
        if (key === "status" && value === "active") continue;
        if (key === "gamemode" && value === "any") continue;
        query[key] = value;
      }
      this.$router.replace({ query }).catch(() => {});
    },
    profileOf(ban) {
      return ban.steamId64 ? this.profiles[ban.steamId64] : undefined;
    },
    avatarOf(ban) {
      return this.profileOf(ban)?.avatar;
    },
    // only worth a second line when they actually renamed, not on case or spacing
    personaOf(ban) {
      const persona = this.profileOf(ban)?.name;
      if (!persona) return null;
      const same = (a, b) => (a || "").trim().toLowerCase() === (b || "").trim().toLowerCase();
      return same(persona, ban.name) ? null : persona;
    },
    // the key matches the filter tabs, the label is what the tag shows
    statusOf(ban) {
      if (!ban.active) return { key: "unbanned", label: "Unbanned", type: "is-success" };
      if (!ban.permanent && ban.unbanAt * 1000 < Date.now())
        return { key: "expired", label: "Expired", type: "is-warning" };
      return { key: "active", label: "Banned", type: "is-danger" };
    },
    rowClass(row) {
      const key = this.statusOf(row).key;
      return key === "active" ? "is-banned" : `is-${key}`;
    },
    // What decides the compact layout is whether the full row fits, not the viewport:
    // a narrow window or a long reason can overflow a desktop just as well as a phone.
    // The measurement runs with is-compact off, otherwise the compact table would
    // always report that it fits and the layout would flip back and forth.
    measureFit() {
      const wrap = this.$refs.wrap;
      const table = this.$refs.table;
      if (!wrap || !table) return;
      const restore = table.className;
      // the spare pixel keeps sub-pixel widths from flickering the layout
      const overflows = () => wrap.scrollWidth > wrap.clientWidth + 1;

      // each tier is measured from a known state rather than from the one in force,
      // so the answer never depends on the current layout and cannot oscillate
      table.classList.remove("is-compact", "is-minimal");
      let tier = "";
      if (overflows()) {
        table.classList.add("is-compact");
        // two columns still do not fit on a narrow phone, so SteamID goes as well
        tier = overflows() ? "minimal" : "compact";
      }
      table.className = restore;
      this.tier = tier;
    },
    // In the compact layout only two columns are shown and the rest live in a detail
    // row. Every column is visible otherwise, so the toggle is inert there.
    toggleRow(ban, event) {
      // leave the steam profile link and the edit button to do their own job
      if (event.target.closest("a, button")) return;
      this.expandedId = this.expandedId === ban.id ? null : ban.id;
    },
    // clicking the active column flips direction, a new column starts descending
    toggleSort(field) {
      const dir = field === this.sortField && this.sortDirection === "desc" ? "asc" : "desc";
      this.setQuery({ sort: `${field}:${dir}` });
    },
    actorText(actor) {
      if (!actor) return "";
      if (actor.kind === "discord") return actor.name;
      if (actor.kind === "github") return actor.login;
      if (actor.kind === "steam") return actor.steamId;
      if (actor.kind === "system") return actor.name;
      return actor.raw;
    },
    // one place deciding how a banner is shown: platform icon, best available name, link
    actorInfo(actor) {
      if (!actor) return { icon: "help-circle-outline", label: "unknown", url: null };
      switch (actor.kind) {
        case "steam":
          return {
            icon: "steam",
            // the current persona when we resolved it, the raw id otherwise
            label: this.profiles[actor.steamId64]?.name || actor.steamId,
            url: actor.steamId64 ? `https://steamcommunity.com/profiles/${actor.steamId64}` : null,
          };
        case "github":
          // the site pins MDI 3.2.89, where the plain "github" icon does not exist yet
          return {
            icon: "github-circle",
            label: actor.login,
            url: `https://github.com/${actor.login}`,
          };
        case "discord":
          return { icon: "discord", label: actor.name, url: null };
        case "system":
          return { icon: "robot", label: actor.name, url: null };
        default:
          return { icon: "help-circle-outline", label: actor.raw, url: null };
      }
    },
    openBan() {
      this.$refs.createModal?.start();
    },
    openEdit(ban) {
      this.$refs.editModal?.start(ban, this.profileOf(ban));
    },
    // the write endpoints answer with the authoritative record, so no refetch
    applyBan({ ban, profiles }) {
      if (profiles) this.profiles = { ...this.profiles, ...profiles };
      const index = this.bans.findIndex(b => b.id === ban.id);
      if (index === -1) this.bans = [ban, ...this.bans];
      else this.bans.splice(index, 1, ban);
    },
    day(ts) {
      if (!ts) return "-";
      return new Date(ts * 1000).toISOString().slice(0, 10);
    },
    absolute(ts) {
      if (!ts) return "-";
      return new Date(ts * 1000).toLocaleString();
    },
    until(ts) {
      if (!ts) return "-";
      const diff = ts * 1000 - Date.now();
      const days = Math.round(Math.abs(diff) / 86400000);
      const label =
        days >= 365
          ? `${Math.round(days / 365)} y`
          : days >= 1
            ? `${days} d`
            : `${Math.max(1, Math.round(Math.abs(diff) / 3600000))} h`;
      return diff > 0 ? `in ${label}` : `${label} ago`;
    },
    relative(ts) {
      if (!ts) return "never";
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

<style lang="scss">
// The compact ban layout, shared by the two things that ask for it: the measured
// is-compact class, and the phone breakpoint that does not wait to be told.
@mixin compact-bans {
  // Only Player and SteamID survive; everything else moves into the row
  // that opens underneath, so nine columns never have to fit at once.
  th:nth-child(n + 3),
  td:nth-child(n + 3) {
    display: none;
  }

  tbody tr:not(.ban-detail) {
    cursor: pointer;
  }

  // the chevron sits at the end of the row rather than inside a column
  tbody td:nth-child(2) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  tbody td:nth-child(2) .expand-chevron {
    display: inline-flex;
    flex: none;
    opacity: 0.5;
    transition: transform 0.2s ease-out;
  }

  tr.is-expanded td:nth-child(2) .expand-chevron {
    transform: rotate(180deg);
  }

  .ban-detail {
    display: table-row;

    // still a column of its own at this tier
    .detail-steamid {
      display: none;
    }

    > td {
      padding-top: 0;
    }

    dl > div {
      display: flex;
      gap: 0.75rem;
      padding: 0.15rem 0;
    }

    dt {
      flex: none;
      width: 6rem;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      opacity: 0.55;
      padding-top: 0.15rem;
    }

    dd {
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .button {
      margin-top: 0.5rem;
    }
  }
}

// One tier down: SteamID does not fit either, so Player is the only column left and
// the id joins the rest in the detail row. Always used together with compact-bans.
@mixin minimal-bans {
  th:nth-child(2) {
    display: none;
  }

  // matches compact-bans' own specificity, which turns this cell into a flex row
  tbody td:nth-child(2) {
    display: none;
  }

  // the chevron moves up a column, the one in the SteamID cell went with it
  .player-cell {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .player-cell .expand-chevron {
    display: inline-flex;
    flex: none;
    opacity: 0.5;
    transition: transform 0.2s ease-out;
  }

  tr.is-expanded .player-cell .expand-chevron {
    transform: rotate(180deg);
  }

  .ban-detail .detail-steamid {
    display: flex;
  }
}

#bans {
  .appeal-callout {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    background: $grey-dark;
    border-radius: 6px;
    padding: 0.75rem 1rem;
    margin-bottom: 1.25rem;

    .callout-text {
      opacity: 0.6;
      margin-left: 0.5rem;
    }
  }

  .bans-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;

    .tabs {
      margin-bottom: 0 !important;

      .count {
        opacity: 0.5;
      }
    }

    .search {
      margin-left: auto;
      width: 18rem;
      max-width: 100%;
    }
  }

  .updated {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-bottom: 1rem;

    .refresh {
      height: auto;
      padding: 0 0.25rem;
      font-size: inherit;
      color: $primary;
      text-decoration: none;
    }
  }

  // b-loading positions against the nearest positioned ancestor, and needs somewhere to
  // show before the table exists on the very first load
  .table-wrap {
    position: relative;
    min-height: 8rem;
    // the fallback for the moment before measureFit() has run: the table scrolls
    // inside the page rather than dragging the whole layout sideways
    overflow-x: auto;

    // Buefy's scrim is a white 50% wash, which is backwards on the dark theme
    .loading-overlay .loading-background {
      background: rgba($grey-darker, 0.7);
    }

    .loading-icon::after {
      border-color: transparent transparent $primary $primary !important;
    }
  }

  .ban-table {
    .player {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .avatar {
      width: 2rem;
      height: 2rem;
      border-radius: 3px;
      flex: none;
      object-fit: cover;

      &.placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        background: $grey-dark;
        opacity: 0.6;
      }
    }

    .names {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
      min-width: 0;

      .nick {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 10rem;
      }

      .persona {
        font-size: 0.75rem;
        opacity: 0.55;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 10rem;
      }
    }

    .steamid {
      font-family: monospace;
      font-size: 0.8rem;
    }

    .reason {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      max-width: 16rem;
    }

    .actor {
      display: flex;
      align-items: center;
      gap: 0.4em;
      white-space: nowrap;

      .platform {
        opacity: 0.5;
        flex: none;
      }

      a {
        color: inherit;
        text-decoration: underline dotted;
      }
    }

    .actions-cell {
      text-align: right;
      white-space: nowrap;
    }

    // the status tag carries the state, this only dims what is no longer in force
    tr.is-expired td,
    tr.is-unbanned td {
      opacity: 0.65;
    }

    .empty {
      text-align: center;
      padding: 2rem 0;
      opacity: 0.7;
    }

    .permanent {
      color: $danger;
    }

    // both only exist for the compact layout below
    .expand-chevron,
    .ban-detail {
      display: none;
    }
  }

  // On a phone the filters read better stacked than squeezed onto one row.
  @media (max-width: 768px) {
    .bans-header {
      .gamemode,
      .search,
      .new-ban {
        margin-left: 0;
        width: 100%;
      }

      .new-ban {
        justify-content: center;
      }
    }

    // a phone can never fit the full row, so it does not wait on a measurement
    // that only lands after hydration
    .ban-table {
      @include compact-bans;
    }
  }

  // even two columns overflow a narrow phone, same reasoning as above
  @media (max-width: 420px) {
    .ban-table {
      @include minimal-bans;
    }
  }

  // set by measureFit() whenever the row overflows its container, at any width
  .ban-table.is-compact,
  .ban-table.is-minimal {
    @include compact-bans;
  }

  // must follow the block above, it overrides rules of equal specificity
  .ban-table.is-minimal {
    @include minimal-bans;
  }
}
</style>
