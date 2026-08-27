<template lang="pug">
.ban-edit-modal
  b-modal(:active.sync="show", has-modal-card, @close="discard")
    .modal-card(v-if="ban")
      header.modal-card-head
        p.modal-card-title Edit ban

      form#ban-edit-modal.modal-card-body(@submit.prevent="save")
        .target
          img.avatar(v-if="profile && profile.avatar", :src="profile.avatar", alt="")
          .avatar.placeholder(v-else)
            b-icon(icon="account")
          .who
            span.name {{ ban.name || "???" }}
            span.mono {{ ban.steamId }}

        .summary
          .row
            span.label Banned
            span {{ absolute(ban.bannedAt) }}
          .row
            span.label Currently
            span(v-if="ban.permanent") permanent
            span(v-else) expires {{ absolute(ban.unbanAt) }}

        b-field(label="Reason")
          b-input(v-model="reason", maxlength="500", required)

        b-field(label="Length", :message="lengthHint")
          b-select(v-model="length", expanded)
            option(value="keep") Keep the current expiry
            option(v-for="p in PRESETS", :key="p.value", :value="p.value") {{ p.label }}

        b-field(
          v-if="length === 'custom'",
          label="Custom length",
          :type="customValid ? '' : 'is-danger'",
          :message="customValid ? '' : 'Use 1d, 2w, 1y6mo and so on.'"
        )
          b-input(v-model="custom", placeholder="3w2d")

        p.note
          b-icon(icon="information-outline", size="is-small")
          span &nbsp;Saving re-issues the ban through banni.

      .modal-card-foot.buttons.is-right
        button.button(type="button", @click="discard", :disabled="busy") Close
        button.button.is-danger.is-outlined(type="button", @click="askUnban", :disabled="busy")
          b-icon(icon="lock-open")
          span &nbsp;Unban
        button.button.is-primary(
          type="submit",
          form="ban-edit-modal",
          :class="{ 'is-loading': busy }",
          :disabled="!canSave"
        )
          b-icon(icon="check")
          span &nbsp;Save changes
</template>

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
      this.$buefy.toast.open({
        type: "is-danger",
        message: err.response?.data?.error || what,
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

        const { data } = await this.$axios.post(`${this.$config.metaconcordUrl}/bans`, body);
        this.$emit("saved", data);
        this.$buefy.toast.open({ type: "is-success", message: `Updated ${data.ban.name}` });
        this.discard();
      } catch (err) {
        this.fail(err, "Updating the ban failed");
      }
      this.busy = false;
    },
    askUnban() {
      this.$buefy.dialog.prompt({
        title: "Unban",
        message: `Why are you lifting the ban on <b>${this.ban.name || this.ban.steamId}</b>?`,
        inputAttrs: { placeholder: "Appealed", maxlength: 500, required: true },
        confirmText: "Unban",
        type: "is-danger",
        trapFocus: true,
        onConfirm: value => this.unban(value),
      });
    },
    async unban(reason) {
      if (!reason || !reason.trim()) return;
      this.busy = true;
      try {
        const { data } = await this.$axios.post(
          `${this.$config.metaconcordUrl}/bans/${encodeURIComponent(this.ban.steamId)}/unban`,
          { reason: reason.trim() }
        );
        this.$emit("saved", data);
        this.$buefy.toast.open({ type: "is-success", message: `Unbanned ${data.ban.name}` });
        this.discard();
      } catch (err) {
        this.fail(err, "Lifting the ban failed");
      }
      this.busy = false;
    },
  },
};
</script>
