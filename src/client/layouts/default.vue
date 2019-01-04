<template lang="pug">
#default
    nav.navbar(aria-label="main navigation")
        .navbar-brand
            nuxt-link(to="/")
                img.navbar-item.is-paddingless(src="@/static/logo.png")
            a.navbar-burger(:class="{ 'is-active': burger }", aria-label="menu", @click="burger = !burger", :aria-expanded="burger")
                span(aria-hidden="true")
                span(aria-hidden="true")
                span(aria-hidden="true")
        .navbar-menu(:class="{ 'is-active': burger }")
            .navbar-start
                nuxt-link.navbar-item(to="/irc")
                    b-icon(icon="chat", pack="mdi")
                    span &nbsp;IRC
                a.navbar-item(href="https://steamcommunity.com/groups/metastruct/discussions")
                    b-icon(icon="forum")
                    span &nbsp;Forums
                a.navbar-item(href="https://github.com/metastruct")
                    b-icon(icon="github-circle")
                    span &nbsp;GitHub
                template(v-if="$store.state.user.isAdmin")
                    a.navbar-item(href="https://gitlab.com/metastruct")
                        b-icon(icon="gitlab")
                        span &nbsp;GitLab
                    a.navbar-item(href="/rocket2")
                        b-icon(icon="rocket")
                        span &nbsp;Rocket
                    a.navbar-item(href="/msdnaa")
                        b-icon(icon="key")
                        span &nbsp;MSDNAA
            .navbar-end
                .navbar-item.has-dropdown.is-hoverable
                    a.navbar-link
                        b-icon(icon="application")
                        span &nbsp;API
                    .navbar-dropdown
                        a.navbar-item(href="/api/v1/servers") Servers
                        a.navbar-item(href="/api/v1/addons") Add-ons
                        a.navbar-item(v-if="$store.state.user.steamID", href="/auth/info") Steam Auth Info
                a.navbar-item(v-if="!$store.state.discordUser.id", href="https://metastruct.net/discord/auth")
                    b-icon(icon="discord")
                    span &nbsp;Discord Linking
                .navbar-item(v-else)
                    b-icon(icon="discord")
                    span {{ "&nbsp;" + $store.state.discordUser.username }}
                a.navbar-item(v-if="!$store.state.user.steamID", href="/auth")
                    b-icon(icon="steam")
                    span &nbsp;Steam Login
                .navbar-item(v-else)
                    b-icon(icon="steam")
                    span {{ "&nbsp;" + $store.state.user.nickname }}

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
                .column.is-one-third
                    img.logo(src="@/static/logo.png")
                .column.is-one-third
                    p.subtitle.has-text-light
                        b-icon(icon="map", size="is-small")
                        span &nbsp;Sitemap
                    ul
                        li: nuxt-link.has-text-primary(to="/")
                            b-icon(icon="home", size="is-small")
                            span &nbsp;Home
                        li: nuxt-link.has-text-primary(to="/addons")
                            b-icon(icon="puzzle", size="is-small")
                            span &nbsp;Add-ons
                        li: nuxt-link.has-text-primary(to="/history")
                            b-icon(icon="calendar-multiselect", size="is-small")
                            span &nbsp;History
                        li: nuxt-link.has-text-primary(to="/irc")
                            b-icon(icon="chat", size="is-small")
                            span &nbsp;IRC
                .column.is-one-third
                    p.subtitle.has-text-light
                        b-icon(icon="arrow-right", size="is-small")
                        span &nbsp;External
                    ul
                        li: a.has-text-primary(href="https://loadingscreen.metastruct.net", target="_blank")
                            b-icon(icon="folder-image", size="is-small")
                            span &nbsp;Gallery
                        li: a.has-text-primary(href="https://banni.metastruct.net", target="_blank")
                            b-icon(icon="minus-circle", size="is-small")
                            span &nbsp;Bans

</template>

<script>

import CyclingBackground from "@/components/CyclingBackground.vue"
import axios from "axios"

export default {
    components: {
        CyclingBackground
    },
    data() {
        return {
            burger: false,

            backgrounds: [
                "/banner/ugly.jpg",
                "/banner/1.jpg",
                "/banner/2.jpg",
                "/banner/3.jpg",
                "/banner/4.jpg",
                "/banner/5.jpg",
                "/banner/6.jpg",
                "/banner/7.jpg",
                "/banner/9.jpg"
            ]
        }
    },
    mounted() {
        axios.get("http://metastruct.net/discord/auth/info.json", { withCredentials: true })
            .then(res => {
                this.$store.commit("discordUser", res.data)
            })
            .catch(console.error)
    }
}

</script>

<style lang="scss" scoped>

@import "@/assets/overrides.scss";

.navbar {
    .navbar-brand {
        img.navbar-item {
            height: 52px;
        }

        a.navbar-burger {
            color: $light;
        }
    }

    .navbar-menu {
        background-color: transparent;

        .navbar-item, .navbar-link {
            color: $light;
        }

        a.navbar-item, .navbar-item.has-dropdown, .navbar-link {
            &:hover, &:active, &:focus, &:hover .navbar-link {
                color: $primary;
                background-color: rgba(darken($dark, 10%), 0.75);
            }
        }

        .navbar-link::after {
            border-color: $secondary;
        }

        .navbar-dropdown {
            border-top: none;
            background: darken($dark, 5%);
        }
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

.navbar, .footer {
    background-color: darken($dark, 5%);
}

</style>
