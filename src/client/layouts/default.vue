<template lang="pug">
#default
  nav.navbar(aria-label="main navigation")
    .container
      .navbar-brand
        nuxt-link(to="/")
          img.logo.navbar-item(src="/img/logo.svg")
        .navbar-burger(
          :class="{ 'is-active': burger }",
          aria-label="menu",
          @click="burger = !burger",
          :aria-expanded="burger"
        )
          span(aria-hidden="true")
          span(aria-hidden="true")
          span(aria-hidden="true")
      .navbar-menu(:class="{ 'is-active': burger }")
        .navbar-start
          a.navbar-item(href="https://steamcommunity.com/groups/metastruct/discussions")
            b-icon(icon="forum")
            span &nbsp;Forums
          a.navbar-item(href="https://github.com/metastruct")
            b-icon(icon="github-circle")
            span &nbsp;GitHub
          a.navbar-item(href="https://merch.metastruct.net")
            b-icon(icon="shopping")
            span &nbsp;Merchandise
          .navbar-item.has-dropdown.is-hoverable
            a.navbar-link
              b-icon(icon="dots-horizontal")
              span &nbsp;Others
            .navbar-dropdown
              a.navbar-item(href="https://chatsounds.metastruct.net") Chatsounds
              a.navbar-item(href="https://dumps.metastruct.net") Gmod Dumps
              a.navbar-item(href="https://wiki.metastruct.net") Gmod Wiki
        .navbar-end
          .navbar-item.has-dropdown.is-hoverable(v-if="$store.state.user.isAdmin")
            a.navbar-link
              b-icon(icon="key")
              span &nbsp;Admin
            .navbar-dropdown
              a.navbar-item(href="https://gitlab.com/metastruct")
                b-icon(icon="gitlab")
                span &nbsp;GitLab
              a.navbar-item(href="/rocket2")
                b-icon(icon="rocket")
                span &nbsp;Rocket
              a.navbar-item(href="/msdnaa")
                b-icon(icon="key")
                span &nbsp;MSDNAA
          .navbar-item(v-if="$store.state.user.login")
            img.avatar(:src="$store.state.user.avatarUrl", :alt="$store.state.user.login")
            span &nbsp;{{ $store.state.user.login }}
          a.navbar-item(
            v-if="!$store.state.user.login",
            :href="`${$config.metaconcordUrl}/auth/github?redirect=${encodeURIComponent($route.fullPath)}`"
          )
            b-icon(icon="github")
            span &nbsp;Log in
          a.navbar-item(v-if="$store.state.user.login", @click="$store.dispatch('logout')")
            b-icon(icon="logout")
            span &nbsp;Log out

  .hero.is-dark
    CyclingBackground(:images="backgrounds")
      .hero-body
        .container
          h1.title Tinkering games one byte at a time.
          h2.subtitle We are a gaming community dedicated to research and development of sandbox experiences.
  nuxt
  footer.footer
    .container
      .columns.is-centered
        .column.is-one-quarter
          nuxt-link(to="/")
            img.logo(src="/img/logo.svg")
        .column.is-one-quarter
          p.subtitle
            b-icon(icon="map", size="is-small")
            span &nbsp;Sitemap
          ul
            li: nuxt-link(to="/")
              b-icon(icon="home", size="is-small")
              span &nbsp;Home
            li: nuxt-link(to="/addons")
              b-icon(icon="puzzle", size="is-small")
              span &nbsp;Add-ons
            li: nuxt-link(to="/history")
              b-icon(icon="calendar-multiselect", size="is-small")
              span &nbsp;History
            li: a(href="https://www.metastruct.net/discord")
              b-icon(icon="discord", size="is-small")
              span &nbsp;Discord
        .column.is-one-quarter
          p.subtitle
            b-icon(icon="arrow-right", size="is-small")
            span &nbsp;External
          ul
            li: a(href="https://loadingscreen.metastruct.net", target="_blank")
              b-icon(icon="folder-image", size="is-small")
              span &nbsp;Gallery
            li: a(href="https://banni.metastruct.net", target="_blank")
              b-icon(icon="minus-circle", size="is-small")
              span &nbsp;Bans
        .column.is-one-quarter
          p Copyright Metastruct © 2018-2022
          p
            | website:
            |
            a(href="https://bell.moe") Bell
          p
            | history layout:
            |
            a(href="https://zombie.computer") ukgamer
          p
            | old discord linking: PotcFdk
          p
            | logo: KeyLimePie
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
