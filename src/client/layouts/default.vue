<template>
  <div id="default">
    <nav class="navbar" aria-label="main navigation">
      <div class="container">
        <div class="navbar-brand">
          <nuxt-link to="/">
            <img class="logo navbar-item" src="/img/logo.svg" />
          </nuxt-link>
          <div
            class="navbar-burger"
            :class="{ 'is-active': burger }"
            aria-label="menu"
            :aria-expanded="burger"
            @click="burger = !burger"
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </div>
        </div>
        <div class="navbar-menu" :class="{ 'is-active': burger }">
          <div class="navbar-start">
            <a class="navbar-item" href="https://steamcommunity.com/groups/metastruct/discussions">
              <b-icon icon="forum" />
              <span>&nbsp;Forums</span>
            </a>
            <a class="navbar-item" href="https://github.com/metastruct">
              <b-icon icon="github-circle" />
              <span>&nbsp;GitHub</span>
            </a>
            <a class="navbar-item" href="https://merch.metastruct.net">
              <b-icon icon="shopping" />
              <span>&nbsp;Merchandise</span>
            </a>
            <div class="navbar-item has-dropdown is-hoverable">
              <a class="navbar-link">
                <b-icon icon="dots-horizontal" />
                <span>&nbsp;Others</span>
              </a>
              <div class="navbar-dropdown">
                <a class="navbar-item" href="https://chatsounds.metastruct.net">Chatsounds</a>
                <a class="navbar-item" href="https://dumps.metastruct.net">Gmod Dumps</a>
                <a class="navbar-item" href="https://wiki.metastruct.net">Gmod Wiki</a>
              </div>
            </div>
          </div>
          <div class="navbar-end">
            <div v-if="$store.state.user.isAdmin" class="navbar-item has-dropdown is-hoverable">
              <a class="navbar-link">
                <b-icon icon="key" />
                <span>&nbsp;Admin</span>
              </a>
              <div class="navbar-dropdown">
                <a class="navbar-item" href="https://gitlab.com/metastruct">
                  <b-icon icon="gitlab" />
                  <span>&nbsp;GitLab</span>
                </a>
                <nuxt-link class="navbar-item" to="/rocket">
                  <b-icon icon="rocket" />
                  <span>&nbsp;Rocket</span>
                </nuxt-link>
                <nuxt-link class="navbar-item" to="/bans">
                  <b-icon icon="minus-circle" />
                  <span>&nbsp;Bans</span>
                </nuxt-link>
                <a
                  v-if="($store.state.user.teams || []).includes('administrators')"
                  class="navbar-item"
                  :href="$config.metaconcordUrl"
                  target="_blank"
                >
                  <b-icon icon="robot" />
                  <span>&nbsp;Metaconcord</span>
                </a>
              </div>
            </div>
            <div v-if="$store.state.user.login" class="navbar-item">
              <img
                class="avatar"
                :src="$store.state.user.avatarUrl"
                :alt="$store.state.user.login"
              />
              <span>&nbsp;{{ $store.state.user.login }}</span>
            </div>
            <a
              v-if="!$store.state.user.login"
              class="navbar-item"
              :href="`${$config.metaconcordUrl}/auth/github?redirect=${encodeURIComponent(
                $route.fullPath
              )}`"
            >
              <b-icon icon="github" />
              <span>&nbsp;Log in</span>
            </a>
            <a
              v-if="$store.state.user.login"
              class="navbar-item"
              @click="$store.dispatch('logout')"
            >
              <b-icon icon="logout" />
              <span>&nbsp;Log out</span>
            </a>
          </div>
        </div>
      </div>
    </nav>

    <div v-if="$route.name !== 'rocket'" class="hero is-dark">
      <CyclingBackground :images="backgrounds">
        <div class="hero-body">
          <div class="container">
            <h1 class="title">Tinkering games one byte at a time.</h1>
            <h2 class="subtitle">
              We are a gaming community dedicated to research and development of sandbox
              experiences.
            </h2>
          </div>
        </div>
      </CyclingBackground>
    </div>
    <nuxt />
    <footer class="footer">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-one-quarter">
            <nuxt-link to="/">
              <img class="logo" src="/img/logo.svg" />
            </nuxt-link>
          </div>
          <div class="column is-one-quarter">
            <p class="subtitle">
              <b-icon icon="map" size="is-small" />
              <span>&nbsp;Sitemap</span>
            </p>
            <ul>
              <li>
                <nuxt-link to="/">
                  <b-icon icon="home" size="is-small" />
                  <span>&nbsp;Home</span>
                </nuxt-link>
              </li>
              <li>
                <nuxt-link to="/addons">
                  <b-icon icon="puzzle" size="is-small" />
                  <span>&nbsp;Add-ons</span>
                </nuxt-link>
              </li>
              <li>
                <nuxt-link to="/history">
                  <b-icon icon="calendar-multiselect" size="is-small" />
                  <span>&nbsp;History</span>
                </nuxt-link>
              </li>
              <li>
                <nuxt-link to="/bans">
                  <b-icon icon="minus-circle" size="is-small" />
                  <span>&nbsp;Bans</span>
                </nuxt-link>
              </li>
              <li>
                <a href="https://www.metastruct.net/discord">
                  <b-icon icon="discord" size="is-small" />
                  <span>&nbsp;Discord</span>
                </a>
              </li>
            </ul>
          </div>
          <div class="column is-one-quarter">
            <p class="subtitle">
              <b-icon icon="arrow-right" size="is-small" />
              <span>&nbsp;External</span>
            </p>
            <ul>
              <li>
                <a href="https://loadingscreen.metastruct.net" target="_blank">
                  <b-icon icon="folder-image" size="is-small" />
                  <span>&nbsp;Gallery</span>
                </a>
              </li>
            </ul>
          </div>
          <div class="column is-one-quarter">
            <p>Copyright Metastruct © 2018-{{ new Date().getFullYear() }}</p>
            <p>
              website:
              <a href="https://bell.moe">Bell</a>
            </p>
            <p>
              history layout:
              <a href="https://zombie.computer">ukgamer</a>
            </p>
            <p>old discord linking: PotcFdk</p>
            <p>logo: KeyLimePie</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style lang="scss">
.navbar {
  .navbar-brand {
    .logo {
      padding-top: 0;
      padding-bottom: 0;
    }
  }

  .avatar {
    width: 1.5em;
    height: 1.5em;
    border-radius: 50%;
  }
}

.hero-body {
  height: 100%;

  .container {
    height: 100%;
    flex-direction: column;
    display: flex;
    justify-content: center;
  }
}
</style>

<script>
import CyclingBackground from "@/components/CyclingBackground.vue";

export default {
  components: {
    CyclingBackground,
  },
  data() {
    return {
      burger: false,

      backgrounds: [
        "/img/banner/ugly.jpg",
        "/img/banner/1.jpg",
        "/img/banner/2.jpg",
        "/img/banner/3.jpg",
        "/img/banner/4.jpg",
        "/img/banner/5.jpg",
        "/img/banner/6.jpg",
        "/img/banner/7.jpg",
        "/img/banner/9.jpg",
      ],
    };
  },
};
</script>
