<template lang="pug">
#default
    nav.navbar.is-fixed-top(aria-label="main navigation")
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
                // a.navbar-item(href="https://gitlab.com/metastruct") // Show only if logged in, on right
                    b-icon(icon="gitlab")
                    span &nbsp;GitLab
            .navbar-end
                a.navbar-item(href="https://metastruct.net/discord/auth")
                    b-icon(icon="discord")
                    span(v-if="!$store.state.discordUser") &nbsp;Discord Linking
                    span(v-else) {{ "&nbsp;" + !$store.state.discordUser.username }}

    .hero.is-dark
        CyclingBackground(:images="backgrounds")
            .hero-body
                .container
                    h1.title Tinkering games one byte at a time.
                    h2.subtitle We are a gaming community dedicated to research and development of sandbox experiences.
    nuxt

</template>

<style lang="scss" scoped>

@import "@/assets/overrides.scss";

.navbar {
    background-color: darken($dark, 5%);

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

        a.navbar-item {
            color: $light;

            &:hover {
                color: $primary;
                background-color: rgba(darken($dark, 10%), 0.75);
            }
        }
    }
}

.hero-body {
    height: 100%;

    .container {
        height: 100%;
        flex-direction: column;
        display: flex;
        justify-content: flex-end;
    }
}

</style>

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
                console.log(res.data)
                this.$store.commit("discordUser", res.data)
            })
            .catch(console.error)
    }
}

</script>
