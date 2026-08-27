<template>
  <div class="ban-edit-modal">
    <BaseModal v-model:active="show" @close="discard">
      <div v-if="ban" class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Edit ban</p>
        </header>

        <form id="ban-edit-modal" class="modal-card-body" @submit.prevent="save">
          <div class="target">
            <img v-if="profile && profile.avatar" class="avatar" :src="profile.avatar" alt="" >
            <div v-else class="avatar placeholder">
              <MdiIcon icon="account" />
            </div>
            <div class="who">
              <span class="name">{{ ban.name || "???" }}</span>
              <span class="mono">{{ ban.steamId }}</span>
            </div>
          </div>

          <div class="summary">
            <div class="row">
              <span class="label">Banned</span>
              <span>{{ absolute(ban.bannedAt) }}</span>
            </div>
            <div class="row">
              <span class="label">Currently</span>
              <span v-if="ban.permanent">permanent</span>
              <span v-else>expires {{ absolute(ban.unbanAt) }}</span>
            </div>
          </div>

          <FormField label="Reason">
            <FormInput v-model="reason" maxlength="500" required />
          </FormField>

          <FormField label="Length" :message="lengthHint">
            <FormSelect v-model="length" expanded>
              <option value="keep">Keep the current expiry</option>
              <option v-for="p in PRESETS" :key="p.value" :value="p.value">{{ p.label }}</option>
            </FormSelect>
          </FormField>

          <FormField
            v-if="length === 'custom'"
            label="Custom length"
            :type="customValid ? '' : 'is-danger'"
            :message="customValid ? '' : 'Use 1d, 2w, 1y6mo and so on.'"
          >
            <FormInput v-model="custom" placeholder="3w2d" />
          </FormField>

          <p class="note">
            <MdiIcon icon="information-outline" size="is-small" />
            <span>&nbsp;Saving re-issues the ban through banni.</span>
          </p>
        </form>

        <div class="modal-card-foot buttons is-right">
          <button class="button" type="button" :disabled="busy" @click="discard">Close</button>
          <button
            class="button is-danger is-outlined"
            type="button"
            :disabled="busy"
            @click="askUnban"
          >
            <MdiIcon icon="lock-open" />
            <span>&nbsp;Unban</span>
          </button>
          <button
            class="button is-primary"
            type="submit"
            form="ban-edit-modal"
            :class="{ 'is-loading': busy }"
            :disabled="!canSave"
          >
            <MdiIcon icon="check" />
            <span>&nbsp;Save changes</span>
          </button>
        </div>
      </div>
    </BaseModal>
    <ConfirmDialog ref="dialog" />
  </div>
</template>

<script>
const PRESETS = [
  { value: "1d", label: "1 day from now" },
  { value: "1w", label: "1 week from now" },
  { value: "4w", label: "4 weeks from now" },
  { value: "6mo", label: "6 months from now" },
  { value: "1y", label: "1 year from now" },
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
  setup() {
    return { toast: useToast() };
  },
  data() {
    return {
      PRESETS,
      show: false,
      busy: false,
      ban: null,
      profile: null,
      reason: "",
      length: "keep",
      custom: "",
    };
  },
  computed: {
    seconds() {
      if (this.length === "keep" || this.length === "permanent") return null;
      return parseDuration(this.length === "custom" ? this.custom : this.length);
    },
    customValid() {
      return this.length !== "custom" || this.seconds > 0;
    },
    lengthHint() {
      if (!this.ban) return "";
      if (this.length === "keep") {
        return this.ban.permanent
          ? "Stays permanent."
          : `Stays at ${this.absolute(this.ban.unbanAt)}`;
      }
      if (this.length === "permanent") return "Never expires.";
      if (!this.seconds) return "";
      return `Expires ${new Date(Date.now() + this.seconds * 1000).toLocaleString()}`;
    },
    canSave() {
      return (
        !this.busy &&
        !!this.reason.trim() &&
        (this.length === "keep" || this.length === "permanent" || this.seconds > 0)
      );
    },
  },
  methods: {
    start(ban, profile) {
      this.ban = ban;
      this.profile = profile || null;
      this.reason = ban.reason || "";
      this.length = "keep";
      this.custom = "";
      this.busy = false;
      this.show = true;
    },
    discard() {
      this.show = false;
    },
    absolute(ts) {
      return ts ? new Date(ts * 1000).toLocaleString() : "-";
    },
    fail(err, what) {
      console.error(err);
      this.toast.open({
        type: "is-danger",
        message: err.data?.error || what,
        duration: 5000,
      });
    },
    // banni has no update call, so an edit is the ban re-issued with override
    async save() {
      if (!this.canSave) return;
      this.busy = true;
      try {
        const body = {
          steamId: this.ban.steamId64 || this.ban.steamId,
          reason: this.reason.trim(),
          gamemode: this.ban.gamemode || undefined,
          override: true,
        };
        if (this.length === "keep") body.unbanAt = this.ban.unbanAt;
        else if (this.length === "permanent") body.permanent = true;
        else body.length = this.length === "custom" ? this.custom : this.length;

        const data = await this.$mc("/bans", { method: "POST", body });
        this.$emit("saved", data);
        this.toast.open({
          type: "is-success",
          message: `Updated ${data.ban.name}`,
        });
        this.discard();
      } catch (err) {
        this.fail(err, "Updating the ban failed");
      }
      this.busy = false;
    },
    async askUnban() {
      const reason = await this.$refs.dialog.open({
        title: "Unban",
        message: `Why are you lifting the ban on ${this.ban.name || this.ban.steamId}?`,
        prompt: true,
        placeholder: "Appealed",
        confirmText: "Unban",
        confirmClass: "is-danger",
      });
      if (reason) this.unban(reason);
    },
    async unban(reason) {
      if (!reason || !reason.trim()) return;
      this.busy = true;
      try {
        const data = await this.$mc(
          `/bans/${encodeURIComponent(this.ban.steamId)}/unban`,
          { method: "POST", body: { reason: reason.trim() } }
        );
        this.$emit("saved", data);
        this.toast.open({
          type: "is-success",
          message: `Unbanned ${data.ban.name}`,
        });
        this.discard();
      } catch (err) {
        this.fail(err, "Lifting the ban failed");
      }
      this.busy = false;
    },
  },
};
</script>

<style lang="scss">
.ban-edit-modal {
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

  .summary {
    margin-bottom: 1rem;

    .row {
      display: flex;
      gap: 0.75rem;
      padding: 0.2rem 0;
    }

    .label {
      flex: none;
      width: 6rem;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      opacity: 0.55;
      margin: 0;
    }
  }

  // a b-message renders a light body in this theme, so this is a plain muted line
  .note {
    display: flex;
    align-items: center;
    margin-top: 1rem;
    font-size: 0.8rem;
    opacity: 0.6;
  }
}
</style>
