<template>
  <div id="appeal">
    <section class="section">
      <div class="container">
        <h1 class="title">Ban appeal</h1>
        <p class="subtitle is-6">Make your case and talk to the developers.</p>

        <client-only>
          <MessageBox v-if="!steamUserLoaded">Loading…</MessageBox>

          <template v-else-if="!steamUser.steamId64">
            <MessageBox type="is-info" has-icon>
              Sign in with Steam so we can look up our records for your account. The login only
              tells us who you are, nothing else.
            </MessageBox>
            <a class="button is-link" :href="loginUrl">
              <MdiIcon icon="steam" size="is-small" />
              <span>&nbsp;Sign in through Steam</span>
            </a>
          </template>

          <template v-else>
            <div class="identity">
              <img v-if="steamUser.avatar" class="avatar" :src="steamUser.avatar" alt="" >
              <div v-else class="avatar placeholder">
                <MdiIcon icon="account" />
              </div>
              <div class="who">
                <span class="name">{{ steamUser.name }}</span>
                <span class="mono">{{ steamUser.steamId64 }}</span>
              </div>
              <button class="button is-small is-text" @click="signOut">Not you? Sign out</button>
            </div>

            <MessageBox v-if="error" type="is-warning" has-icon>{{ error }}</MessageBox>
            <MessageBox v-else-if="!statusLoaded">Checking our records…</MessageBox>

            <MessageBox v-else-if="status === 'not_banned'" type="is-success" has-icon>
              You're not banned.
            </MessageBox>
            <MessageBox v-else-if="status === 'unbanned'" type="is-success" has-icon>
              You have been unbanned.
            </MessageBox>

            <template v-else-if="ban">
              <MessageBox v-if="closedNotice" type="is-warning" has-icon>
                This appeal was closed. Reload the page to start over if you are still banned.
              </MessageBox>

              <div class="ban-card">
                <dl>
                  <div>
                    <dt>Banned</dt>
                    <dd>{{ ban.name }}</dd>
                  </div>
                  <div>
                    <dt>Reason</dt>
                    <dd>{{ ban.reason || "no reason given" }}</dd>
                  </div>
                  <div>
                    <dt>Date banned</dt>
                    <dd :title="absolute(ban.bannedAt)">{{ day(ban.bannedAt) }}</dd>
                  </div>
                  <div>
                    <dt>Expiry</dt>
                    <dd>
                      <span v-if="ban.permanent" class="permanent">permanent</span>
                      <span v-else :title="absolute(ban.unbanAt)">{{ until(ban.unbanAt) }}</span>
                    </dd>
                  </div>
                  <div>
                    <dt>Banner</dt>
                    <dd>
                      <div class="actor">
                        <MdiIcon
                          class="platform"
                          :icon="actorInfo(ban.bannedBy).icon"
                          size="is-small"
                        />
                        <span>{{ actorInfo(ban.bannedBy).label }}</span>
                      </div>
                    </dd>
                  </div>
                  <div v-if="ban.gamemode">
                    <dt>Gamemode</dt>
                    <dd><span class="tag is-dark">{{ ban.gamemode }}</span></dd>
                  </div>
                </dl>
              </div>

              <form v-if="status === 'banned'" @submit.prevent="submit">
                <FormField
                  label="Why should you be unbanned?"
                  :message="`${appealText.length}/1900`"
                >
                  <FormInput
                    v-model="appealText"
                    type="textarea"
                    maxlength="1900"
                    minlength="10"
                    rows="6"
                    placeholder="Explain what happened and why the ban should be lifted."
                    required
                  />
                </FormField>
                <button
                  class="button is-link"
                  :class="{ 'is-loading': submitting }"
                  :disabled="submitting"
                  type="submit"
                >
                  Submit appeal
                </button>
              </form>

              <div v-else class="conversation">
                <MessageBox v-if="status === 'refused'" type="is-warning" has-icon>
                  Your appeal was refused.
                </MessageBox>
                <h2 class="title is-5">Your appeal</h2>
                <p v-if="status === 'appealed'" class="is-size-7 muted">
                  Submitted {{ relativeTime(appealCreatedAt) }}. Replies from the developers show
                  up here, check back once in a while.
                </p>
                <p v-else class="is-size-7 muted">
                  Submitted {{ relativeTime(appealCreatedAt) }}.
                </p>
                <div ref="messageList" class="messages">
                  <div
                    v-for="(msg, i) in messages"
                    :key="msg.id || i"
                    class="message-row"
                    :class="{ 'is-you': msg.isYou }"
                  >
                    <div class="bubble">
                      <div class="meta">
                        <span class="author">{{ msg.isYou ? "You" : msg.author }}</span>
                        <span class="when" :title="absolute(msg.createdAt)">{{
                          relativeTime(msg.createdAt)
                        }}</span>
                      </div>
                      <div class="content">{{ msg.content }}</div>
                    </div>
                  </div>
                  <p v-if="!messages.length" class="muted empty">No replies yet.</p>
                </div>
                <form
                  v-if="status === 'appealed' && !closedNotice"
                  class="reply"
                  @submit.prevent="sendReply"
                >
                  <FormInput
                    v-model="reply"
                    class="grow"
                    type="textarea"
                    maxlength="1500"
                    rows="2"
                    placeholder="Reply…"
                  />
                  <button
                    class="button is-link"
                    :class="{ 'is-loading': sending }"
                    :disabled="sending || !reply.trim()"
                    type="submit"
                  >
                    Send
                  </button>
                </form>
              </div>
            </template>
          </template>
        </client-only>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  setup() {
    useHead({ title: "Ban appeal - Meta Construct" });
    return { ...useSteamUser(), toast: useToast() };
  },
  data() {
    return {
      statusLoaded: false,
      status: null,
      ban: null,
      profiles: {},
      appealId: 0,
      appealCreatedAt: 0,
      appealText: "",
      submitting: false,
      messages: [],
      reply: "",
      sending: false,
      error: null,
      closedNotice: false,
    };
  },
  computed: {
    loginUrl() {
      return `${this.$mcUrl}/auth/steam?redirect=${encodeURIComponent(this.$route.fullPath)}`;
    },
  },
  watch: {
    messages() {
      this.$nextTick(() => {
        const list = this.$refs.messageList;
        if (list) list.scrollTop = list.scrollHeight;
      });
    },
  },
  async mounted() {
    document.addEventListener("visibilitychange", this.onVisibility);
    this._poll = setInterval(this.poll, 15000);
    await this.fetchSteamUser();
    if (this.steamUser.steamId64) await this.loadStatus();
  },
  beforeUnmount() {
    clearInterval(this._poll);
    document.removeEventListener("visibilitychange", this.onVisibility);
  },
  methods: {
    async loadStatus() {
      this.statusLoaded = false;
      this.error = null;
      try {
        const data = await this.$mc("/appeals/me");
        this.status = data.status;
        this.ban = data.ban || null;
        this.profiles = data.profiles || {};
        this.appealId = data.appeal?.id || 0;
        this.appealCreatedAt = data.appeal?.createdAt || 0;
        this.statusLoaded = true;
        if (this.status === "appealed" || this.status === "refused") await this.loadMessages();
        else this.messages = [];
      } catch (err) {
        console.error(err);
        // an expired session answers 401, everything else is the service being down
        if (err.status === 401) await this.fetchSteamUser();
        else this.error = err.data?.error || "The appeal service is unavailable right now.";
      }
    },
    async loadMessages() {
      if (!this.appealId) return;
      try {
        const data = await this.$mc(`/appeals/${this.appealId}/messages`);
        if (data.closed) {
          // the thread is gone on the Discord side; the closedNotice guard keeps a
          // refused appeal with a deleted thread from reloading in a loop
          if (!this.closedNotice) {
            this.closedNotice = true;
            await this.loadStatus();
            // a refusal or unban explains itself, the generic notice is for the rest
            if (this.status !== "banned") this.closedNotice = false;
          }
          return;
        }
        this.messages = data.messages || [];
      } catch (err) {
        // polling failures stay quiet, the next tick retries
        console.error(err);
      }
    },
    poll() {
      if (document.visibilityState !== "visible") return;
      if (this.status === "appealed" && !this.closedNotice) this.loadMessages();
    },
    onVisibility() {
      if (document.visibilityState === "visible") this.poll();
    },
    async submit() {
      const message = this.appealText.trim();
      if (!message) return;
      this.submitting = true;
      try {
        const data = await this.$mc("/appeals", { method: "POST", body: { message } });
        this.status = "appealed";
        this.appealId = data.appeal?.id || 0;
        this.appealCreatedAt = data.appeal?.createdAt || Math.round(Date.now() / 1000);
        this.appealText = "";
        await this.loadMessages();
      } catch (err) {
        console.error(err);
        this.toast.open({
          type: "is-danger",
          message: err.data?.error || "Could not submit your appeal.",
          duration: 4000,
        });
      }
      this.submitting = false;
    },
    async sendReply() {
      const message = this.reply.trim();
      if (!message) return;
      this.sending = true;
      try {
        const data = await this.$mc(`/appeals/${this.appealId}/messages`, {
          method: "POST",
          body: { message },
        });
        if (data.message) this.messages = [...this.messages, data.message];
        this.reply = "";
      } catch (err) {
        console.error(err);
        this.toast.open({
          type: "is-danger",
          message: err.data?.error || "Could not send your message.",
          duration: 4000,
        });
      }
      this.sending = false;
    },
    async signOut() {
      await this.steamLogout();
      this.statusLoaded = false;
      this.status = null;
      this.ban = null;
      this.appealId = 0;
      this.messages = [];
      this.closedNotice = false;
    },
    // same shapes as the bans page banner column, minus the link
    actorInfo(actor) {
      if (!actor) return { icon: "help-circle-outline", label: "unknown" };
      switch (actor.kind) {
        case "steam":
          return {
            icon: "steam",
            label: this.profiles[actor.steamId64]?.name || actor.steamId,
          };
        case "github":
          return { icon: "github-circle", label: actor.login };
        case "discord":
          return { icon: "discord", label: actor.name };
        case "system":
          return { icon: "robot", label: actor.name };
        default:
          return { icon: "help-circle-outline", label: actor.raw };
      }
    },
    relativeTime(ts) {
      if (!ts) return "just now";
      const minutes = Math.round((Date.now() - ts * 1000) / 60000);
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
#appeal {
  .muted {
    opacity: 0.6;
  }

  .identity {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.25rem;

    .avatar {
      width: 42px;
      height: 42px;
      border-radius: 4px;
      flex: none;
    }

    .avatar.placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      background: $grey-light;
    }

    .who {
      display: flex;
      flex-direction: column;
      min-width: 0;

      .name {
        font-weight: 600;
        overflow-wrap: anywhere;
      }

      .mono {
        font-family: monospace;
        font-size: 0.75rem;
        opacity: 0.6;
      }
    }

    > .button.is-text {
      color: $primary;
      text-decoration: none;
    }
  }

  .ban-card {
    background: $grey-dark;
    border-radius: 6px;
    padding: 0.9rem 1.1rem;
    margin-bottom: 1.25rem;

    dl > div {
      display: flex;
      gap: 0.75rem;
      padding: 0.15rem 0;
    }

    dt {
      flex: none;
      width: 7rem;
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

    .permanent {
      font-weight: 600;
    }

    .actor {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
  }

  .conversation {
    .messages {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin: 1rem 0;
      max-height: 24rem;
      overflow-y: auto;
    }

    .message-row {
      display: flex;

      &.is-you {
        justify-content: flex-end;
      }
    }

    .bubble {
      background: $grey-dark;
      border-radius: 6px;
      padding: 0.5rem 0.75rem;
      max-width: 85%;
    }

    .is-you .bubble {
      background: rgba($primary, 0.12);
    }

    .meta {
      display: flex;
      gap: 0.5rem;
      font-size: 0.7rem;
      opacity: 0.6;
      margin-bottom: 0.25rem;
    }

    .content {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    .empty {
      padding: 0.5rem 0;
    }

    .reply {
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;

      .grow {
        flex: 1;
      }
    }
  }
}
</style>
