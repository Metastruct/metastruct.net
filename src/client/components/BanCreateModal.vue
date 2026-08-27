<template>
  <div class="ban-create-modal">
    <b-modal :active.sync="show" has-modal-card @close="discard">
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">New ban</p>
        </header>

        <form id="ban-create-modal" class="modal-card-body" @submit.prevent="confirm">
          <b-message v-if="meta && !meta.serverConnected" type="is-danger" has-icon>
            No game server is connected right now, so bans cannot be issued.
          </b-message>

          <b-field
            label="SteamID"
            :type="lookupError ? 'is-danger' : ''"
            :message="lookupError || 'Any format: STEAM_0:1:1, [U:1:2], or a 64 bit id.'"
          >
            <b-input
              v-model="steamId"
              placeholder="76561197997701057"
              required
              :loading="looking"
              :disabled="!writable"
            />
          </b-field>

          <div v-if="target" class="target">
            <img v-if="target.avatar" class="avatar" :src="target.avatar" alt="" />
            <div v-else class="avatar placeholder">
              <b-icon icon="account" />
            </div>
            <div class="who">
              <span class="name">{{ target.name || "unknown profile" }}</span>
              <span class="mono">{{ target.steamId }}</span>
            </div>
          </div>

          <b-message v-if="target && target.existingBan" type="is-warning" has-icon>
            <p v-if="target.existingBan.active">Already banned: {{ target.existingBan.reason }}</p>
            <p v-else>Previously banned: {{ target.existingBan.reason }}</p>
            <b-checkbox v-if="target.existingBan.active" v-model="override">
              Replace the existing ban
            </b-checkbox>
          </b-message>

          <b-field label="Reason">
            <b-input
              v-model="reason"
              placeholder="Prop spam"
              maxlength="500"
              required
              :disabled="!writable"
            />
          </b-field>

          <b-field label="Length" :message="lengthHint">
            <b-select v-model="length" expanded :disabled="!writable">
              <option v-for="p in PRESETS" :key="p.value" :value="p.value">{{ p.label }}</option>
            </b-select>
          </b-field>

          <b-field
            v-if="length === 'custom'"
            label="Custom length"
            :type="customValid ? '' : 'is-danger'"
            :message="customValid ? '' : 'Use 1d, 2w, 1y6mo and so on.'"
          >
            <b-input v-model="custom" placeholder="3w2d" :disabled="!writable" />
          </b-field>

          <b-field label="Gamemode">
            <b-select v-model="gamemode" expanded :disabled="!writable">
              <option value="">Global (every gamemode)</option>
              <option v-for="g in meta ? meta.gamemodes : []" :key="g" :value="g">{{ g }}</option>
            </b-select>
          </b-field>
        </form>

        <div class="modal-card-foot buttons is-right">
          <button class="button" type="button" :disabled="saving" @click="discard">Close</button>
          <button
            class="button is-danger"
            type="submit"
            form="ban-create-modal"
            :class="{ 'is-loading': saving }"
            :disabled="!canSubmit"
          >
            <b-icon icon="gavel" />
            <span>&nbsp;Ban</span>
          </button>
        </div>
      </div>
    </b-modal>
  </div>
</template>

<style lang="scss">
.ban-create-modal {
  .target {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;

    .avatar {
      width: 3rem;
      height: 3rem;
      border-radius: 4px;
      flex: none;

      &.placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        background: $grey-dark;
        opacity: 0.6;
      }
    }

    .who {
      display: flex;
      flex-direction: column;
      line-height: 1.3;
    }

    .mono {
      font-family: monospace;
      font-size: 0.8rem;
      opacity: 0.6;
    }
  }
}
</style>

<script>
const PRESETS = [
  { value: "1d", label: "1 day" },
  { value: "1w", label: "1 week" },
  { value: "4w", label: "4 weeks" },
  { value: "6mo", label: "6 months" },
  { value: "1y", label: "1 year" },
  { value: "permanent", label: "Permanent" },
  { value: "custom", label: "Custom..." },
];

const UNITS = { y: 31556926, mo: 2628000, w: 604800, d: 86400, h: 3600, m: 60, s: 1 };

// mirrors parseDuration in metaconcord so a bad length is caught before the round trip
const parseDuration = input => {
  let total = 0;
  const matches = String(input)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .matchAll(/(\d+)(y|mo|w|d|h|m|s)/g);
  for (const match of matches) {
    const amount = parseInt(match[1], 10);
    if (!isNaN(amount) && amount > 0) total += amount * UNITS[match[2]];
  }
  return total;
};

export default {
  data() {
    return {
      PRESETS,
      show: false,
      saving: false,
      meta: null,
      steamId: "",
      reason: "",
      length: "1w",
      custom: "",
      gamemode: "",
      override: false,
      target: null,
      looking: false,
      lookupError: null,
    };
  },
  computed: {
    writable() {
      return !this.meta || this.meta.serverConnected;
    },
    seconds() {
      if (this.length === "permanent") return null;
      return parseDuration(this.length === "custom" ? this.custom : this.length);
    },
    customValid() {
      return this.length !== "custom" || this.seconds > 0;
    },
    lengthHint() {
      if (this.length === "permanent") return "Never expires.";
      if (!this.seconds) return "";
      const expires = new Date(Date.now() + this.seconds * 1000);
      return `Expires ${expires.toLocaleString()}`;
    },
    canSubmit() {
      return (
        this.writable &&
        !this.saving &&
        !this.looking &&
        !!this.steamId.trim() &&
        !!this.reason.trim() &&
        (this.length === "permanent" || this.seconds > 0)
      );
    },
  },
  watch: {
    steamId() {
      this.target = null;
      this.lookupError = null;
      this.override = false;
      clearTimeout(this._lookupTimer);
      this._lookupTimer = setTimeout(this.lookup, 500);
    },
  },
  beforeDestroy() {
    clearTimeout(this._lookupTimer);
  },
  methods: {
    start() {
      this.show = true;
      this.saving = false;
      this.steamId = "";
      this.reason = "";
      this.length = "1w";
      this.custom = "";
      this.gamemode = "";
      this.override = false;
      this.target = null;
      this.lookupError = null;
      this.looking = false;
      this.loadMeta();
      this.$nextTick(() =>
        document.querySelector(".ban-create-modal .modal-card-body input")?.focus()
      );
    },
    discard() {
      this.show = false;
    },
    async loadMeta() {
      try {
        const { data } = await this.$axios.get(`${this.$config.metaconcordUrl}/bans/meta`, {
          progress: false,
        });
        this.meta = data;
      } catch (err) {
        console.error(err);
        this.meta = null;
      }
    },
    async lookup() {
      const value = this.steamId.trim();
      if (!value) return;
      this.looking = true;
      try {
        const { data } = await this.$axios.get(
          `${this.$config.metaconcordUrl}/bans/lookup/${encodeURIComponent(value)}`,
          { progress: false }
        );
        this.target = data;
      } catch (err) {
        this.target = null;
        this.lookupError = err.response?.data?.error || "Could not resolve that SteamID.";
      }
      this.looking = false;
    },
    async confirm() {
      if (!this.canSubmit) return;
      this.saving = true;
      try {
        const { data } = await this.$axios.post(`${this.$config.metaconcordUrl}/bans`, {
          steamId: this.steamId.trim(),
          reason: this.reason.trim(),
          length:
            this.length === "permanent"
              ? undefined
              : this.length === "custom"
              ? this.custom
              : this.length,
          permanent: this.length === "permanent",
          gamemode: this.gamemode || undefined,
          override: this.override,
        });
        this.$emit("saved", data);
        this.$buefy.toast.open({ type: "is-success", message: `Banned ${data.ban.name}` });
        this.discard();
      } catch (err) {
        console.error(err);
        this.$buefy.toast.open({
          type: "is-danger",
          message: err.response?.data?.error || "Issuing the ban failed",
          duration: 5000,
        });
      }
      this.saving = false;
    },
  },
};
</script>
