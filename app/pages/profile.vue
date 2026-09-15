<template>
  <div id="profile">
    <section class="section">
      <div class="container is-max-desktop">
        <h1 class="title">Profile</h1>

        <client-only>
          <MessageBox v-if="!userLoaded">Loading…</MessageBox>

          <template v-else-if="!user.id">
            <MessageBox type="is-info" has-icon>
              Log in to see your account and link your platforms.
            </MessageBox>
            <nuxt-link class="button is-link" to="/login?redirect=/profile">Log in</nuxt-link>
          </template>

          <template v-else>
            <div class="identity">
              <img v-if="user.avatar" class="avatar" :src="user.avatar" alt="" >
              <div v-else class="avatar placeholder"><MdiIcon icon="account" /></div>
              <div class="who">
                <span class="name">{{ user.displayName }}</span>
                <div class="tags">
                  <span v-for="role in roles" :key="role" class="tag is-primary">{{ role }}</span>
                  <span v-if="!roles.length" class="tag is-dark">player</span>
                </div>
              </div>
              <button class="button is-small is-text" @click="logout()">Log out</button>
            </div>

            <MessageBox v-if="conflict" type="is-warning" has-icon>
              That {{ conflict }} account belongs to another account that has other ways to log
              in. Log into that account and unlink {{ conflict }} there, then link it here. An
              account with {{ conflict }} as its only login would have been merged into this one.
            </MessageBox>

            <h2 class="title is-5">Linked platforms</h2>
            <div class="platforms">
              <div v-for="p in providers" :key="p.key" class="platform">
                <MdiIcon class="platform-icon" :icon="p.icon" />
                <div class="platform-body">
                  <span class="platform-name">{{ p.label }}</span>
                  <template v-if="linkFor(p.key)">
                    <span class="linked">
                      <img v-if="linkFor(p.key).avatar" class="mini" :src="linkFor(p.key).avatar" alt="" >
                      {{ linkFor(p.key).name }}
                      <span class="mono">{{ linkFor(p.key).id }}</span>
                      <span v-if="linkFor(p.key).source === 'import'" class="tag is-warning is-light">
                        imported, not verified
                      </span>
                    </span>
                  </template>
                  <span v-else class="muted">Not linked</span>
                </div>
                <div class="platform-actions">
                  <template v-if="linkFor(p.key) && linkFor(p.key).source !== 'import'">
                    <button
                      class="button is-small is-danger is-outlined"
                      :disabled="!canUnlink(p.key) || busy === p.key"
                      :title="canUnlink(p.key) ? '' : 'Keep at least one platform that can log you in'"
                      @click="doUnlink(p.key)"
                    >
                      Unlink
                    </button>
                  </template>
                  <template v-else>
                    <a v-if="p.login" class="button is-small is-link" :href="loginUrl(p.key, '/profile')">
                      {{ linkFor(p.key) ? "Verify" : "Link" }}
                    </a>
                    <button
                      v-if="p.ingame"
                      class="button is-small"
                      :class="{ 'is-loading': busy === p.key }"
                      @click="getCode(p.key)"
                    >
                      Link from {{ p.ingame }}
                    </button>
                  </template>
                </div>
              </div>
            </div>

            <div v-if="code" class="code-box">
              <p>
                Join any Metastruct {{ codeGame }} server and type this in chat. The code expires
                {{ codeExpiry }}.
              </p>
              <pre class="chat-line">METACONCORD_LINK {{ code.code }}</pre>
              <p class="muted is-size-7">
                The message is caught by the relay, nobody else sees it. This page updates on its
                own once the link goes through.
              </p>
            </div>
          </template>
        </client-only>
      </div>
    </section>
  </div>
</template>

<script>
import { PROVIDERS } from "@/composables/useUser";

const LOGIN_PROVIDERS = PROVIDERS.filter(p => p.login).map(p => p.key);

export default {
  setup() {
    useHead({ title: "Profile - Meta Construct" });
    return { ...useUser(), toast: useToast() };
  },
  data() {
    return {
      providers: PROVIDERS,
      busy: null,
      // { provider, code, expiresAt } while an in-game code is waiting to be typed
      code: null,
      now: Date.now(),
    };
  },
  computed: {
    conflict() {
      const { error, provider } = this.$route.query;
      return error === "conflict" && typeof provider === "string" ? provider : null;
    },
    codeGame() {
      return PROVIDERS.find(p => p.key === this.code?.provider)?.ingame;
    },
    codeExpiry() {
      const left = Math.max(0, Math.round((this.code.expiresAt - this.now) / 60000));
      return left ? `in ${left} min` : "now";
    },
  },
  mounted() {
    this._tick = setInterval(() => {
      this.now = Date.now();
      if (this.code) this.pollCode();
    }, 5000);
  },
  beforeUnmount() {
    clearInterval(this._tick);
  },
  methods: {
    canUnlink(provider) {
      const logins = (this.user.links || []).filter(l => LOGIN_PROVIDERS.includes(l.provider));
      return logins.some(l => l.provider !== provider);
    },
    async doUnlink(provider) {
      this.busy = provider;
      try {
        await this.unlink(provider);
      } catch (err) {
        this.toast.open({
          type: "is-danger",
          message: err.data?.error || "Could not unlink.",
          duration: 4000,
        });
      }
      this.busy = null;
    },
    async getCode(provider) {
      this.busy = provider;
      try {
        const data = await this.createLinkCode(provider);
        this.code = { provider, ...data };
      } catch (err) {
        this.toast.open({
          type: "is-danger",
          message: err.data?.error || "Could not create a code.",
          duration: 4000,
        });
      }
      this.busy = null;
    },
    async pollCode() {
      if (this.code.expiresAt < this.now) {
        this.code = null;
        return;
      }
      await this.fetchUser();
      if (this.verifiedLink(this.code.provider)) {
        this.toast.open({ message: `${this.codeGame} account linked.` });
        this.code = null;
      }
    },
  },
};
</script>

<style lang="scss">
#profile {
  .muted {
    opacity: 0.6;
  }

  .mono {
    font-family: monospace;
    font-size: 0.75rem;
    opacity: 0.6;
  }

  .identity {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;

    .avatar {
      width: 56px;
      height: 56px;
      border-radius: 6px;
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
      gap: 0.25rem;
      min-width: 0;

      .name {
        font-weight: 600;
        font-size: 1.1rem;
        overflow-wrap: anywhere;
      }
    }

    > .button.is-text {
      margin-left: auto;
      color: $primary;
      text-decoration: none;
    }
  }

  .platforms {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .platform {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: $grey-dark;
    border-radius: 6px;
    padding: 0.6rem 0.9rem;

    .platform-icon {
      flex: none;
      font-size: 1.4rem;
    }

    .platform-body {
      display: flex;
      flex-direction: column;
      min-width: 0;
      flex: 1;

      .platform-name {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        opacity: 0.55;
      }

      .linked {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        flex-wrap: wrap;
        overflow-wrap: anywhere;
      }

      .mini {
        width: 1.2em;
        height: 1.2em;
        border-radius: 50%;
      }
    }

    .platform-actions {
      display: flex;
      gap: 0.4rem;
      flex: none;
    }
  }

  .code-box {
    background: $grey-dark;
    border-radius: 6px;
    padding: 0.9rem 1.1rem;

    .chat-line {
      margin: 0.75rem 0;
      font-size: 1.2rem;
      user-select: all;
    }
  }
}
</style>
