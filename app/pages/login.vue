<template>
  <div id="login">
    <section class="section">
      <div class="container is-max-desktop">
        <h1 class="title">Log in</h1>
        <p class="subtitle is-6">
          Pick any platform. Others can be linked afterwards from your profile.
        </p>

        <client-only>
          <MessageBox v-if="!userLoaded">Loading…</MessageBox>
          <MessageBox v-else-if="user.id" type="is-info" has-icon>
            You are logged in as {{ user.displayName }}.
            <nuxt-link to="/profile">Go to your profile</nuxt-link>.
          </MessageBox>
          <div v-else class="providers">
            <a
              v-for="p in providers"
              :key="p.key"
              class="button is-medium is-fullwidth"
              :class="`is-${p.key}`"
              :href="loginUrl(p.key, redirect)"
            >
              <MdiIcon :icon="p.icon" />
              <span>Continue with {{ p.label }}</span>
            </a>
          </div>
        </client-only>
      </div>
    </section>
  </div>
</template>

<script>
import { PROVIDERS } from "@/composables/useUser";

export default {
  setup() {
    useHead({ title: "Log in - Meta Construct" });
    return useUser();
  },
  computed: {
    providers() {
      return PROVIDERS.filter(p => p.login);
    },
    // ?redirect= from a gated page, else the page the nav link was clicked on; only
    // same-site paths, anything else lands on the home page
    redirect() {
      const back = this.$router.options.history?.state?.back;
      const wanted = this.$route.query.redirect ?? back;
      return typeof wanted === "string" && /^\/(?!\/)/.test(wanted) && !wanted.startsWith("/login")
        ? wanted
        : "/";
    },
  },
};
</script>

<style lang="scss">
#login {
  .providers {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: 24rem;

    .button {
      justify-content: flex-start;
      gap: 0.75rem;
      border: none;
      color: #fff;

      &.is-steam {
        background: #1b2838;
      }
      &.is-discord {
        background: #5865f2;
      }
      &.is-github {
        background: #24292f;
      }
      &.is-gitlab {
        background: #e24329;
      }

      &:hover {
        filter: brightness(1.15);
      }
    }
  }
}
</style>
