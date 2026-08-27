<template>
  <div id="default">
    <nav class="navbar" aria-label="main navigation">
      <div class="container">
        <div class="navbar-brand">
          <nuxt-link to="/">
            <img class="logo navbar-item" src="/img/logo.svg" >
          </nuxt-link>
          <div
            class="navbar-burger"
            :class="{ 'is-active': burger }"
            aria-label="menu"
            :aria-expanded="burger"
            @click="burger = !burger"
          >
            <span aria-hidden="true"/>
            <span aria-hidden="true"/>
            <span aria-hidden="true"/>
          </div>
        </div>
        <div class="navbar-menu" :class="{ 'is-active': burger }">
          <div class="navbar-start">
            <a class="navbar-item" href="https://steamcommunity.com/groups/metastruct/discussions">
              <MdiIcon icon="forum" />
              <span>&nbsp;Forums</span>
            </a>
            <a class="navbar-item" href="https://github.com/metastruct">
              <MdiIcon icon="github-circle" />
              <span>&nbsp;GitHub</span>
            </a>
            <a class="navbar-item" href="https://merch.metastruct.net">
              <MdiIcon icon="shopping" />
              <span>&nbsp;Merchandise</span>
            </a>
            <div class="navbar-item has-dropdown is-hoverable">
              <a class="navbar-link">
                <MdiIcon icon="dots-horizontal" />
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
            <div v-if="user.isAdmin" class="navbar-item has-dropdown is-hoverable">
              <a class="navbar-link">
                <MdiIcon icon="key" />
                <span>&nbsp;Admin</span>
              </a>
              <div class="navbar-dropdown">
                <a class="navbar-item" href="https://gitlab.com/metastruct">
                  <MdiIcon icon="gitlab" />
                  <span>&nbsp;GitLab</span>
                </a>
                <nuxt-link class="navbar-item" to="/rocket">
                  <MdiIcon icon="rocket" />
                  <span>&nbsp;Rocket</span>
                </nuxt-link>
                <nuxt-link class="navbar-item" to="/bans">
                  <MdiIcon icon="minus-circle" />
                  <span>&nbsp;Bans</span>
                </nuxt-link>
                <a
                  v-if="(user.teams || []).includes('administrators')"
                  class="navbar-item"
                  :href="$mcUrl"
                  target="_blank"
                >
                  <MdiIcon icon="robot" />
                  <span>&nbsp;Metaconcord</span>
                </a>
              </div>
            </div>
            <div v-if="user.login" class="navbar-item">
              <img
                class="avatar"
                :src="user.avatarUrl"
                :alt="user.login"
              >
              <span>&nbsp;{{ user.login }}</span>
            </div>
            <a
              v-if="!user.login"
              class="navbar-item"
              :href="`${$mcUrl}/auth/github?redirect=${encodeURIComponent(
                $route.fullPath
              )}`"
            >
              <MdiIcon icon="github" />
              <span>&nbsp;Log in</span>
            </a>
            <a
              v-if="user.login"
              class="navbar-item"
              @click="logout()"
            >
              <MdiIcon icon="logout" />
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
    <slot />
    <footer class="footer">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-one-quarter">
            <nuxt-link to="/">
              <img class="logo" src="/img/logo.svg" >
            </nuxt-link>
          </div>
          <div class="column is-one-quarter">
            <p class="subtitle">
              <MdiIcon icon="map" size="is-small" />
              <span>&nbsp;Sitemap</span>
            </p>
            <ul>
              <li>
                <nuxt-link to="/">
                  <MdiIcon icon="home" size="is-small" />
                  <span>&nbsp;Home</span>
                </nuxt-link>
              </li>
              <li>
                <nuxt-link to="/addons">
                  <MdiIcon icon="puzzle" size="is-small" />
                  <span>&nbsp;Add-ons</span>
                </nuxt-link>
              </li>
              <li>
                <nuxt-link to="/history">
                  <MdiIcon icon="calendar-multiselect" size="is-small" />
                  <span>&nbsp;History</span>
                </nuxt-link>
              </li>
              <li>
                <nuxt-link to="/bans">
                  <MdiIcon icon="minus-circle" size="is-small" />
                  <span>&nbsp;Bans</span>
                </nuxt-link>
              </li>
              <li>
                <a href="https://www.metastruct.net/discord">
                  <MdiIcon icon="discord" size="is-small" />
                  <span>&nbsp;Discord</span>
                </a>
              </li>
            </ul>
          </div>
          <div class="column is-one-quarter">
            <p class="subtitle">
              <MdiIcon icon="arrow-right" size="is-small" />
              <span>&nbsp;External</span>
            </p>
            <ul>
              <li>
                <a href="https://loadingscreen.metastruct.net" target="_blank">
                  <MdiIcon icon="folder-image" size="is-small" />
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

<script>
import CyclingBackground from "@/components/CyclingBackground.vue";

export default {
  components: {
    CyclingBackground,
  },
  setup() {
    return useUser();
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
