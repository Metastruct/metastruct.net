<template lang="pug">
#default
    nav.navbar.is-dark.is-fixed-top
        .navbar-brand
            a(href="https://metastruct.net")
                img.navbar-item.is-paddingless(src="@/assets/logo.png")
            a.navbar-item(href="https://steamcommunity.com/groups/metastruct")
                b-icon(icon="steam")
                span &nbsp;Steam
            a.navbar-item(href="https://metastruct.net/discord")
                b-icon(icon="discord")
                span &nbsp;Discord
            nuxt-link.navbar-item(to="/irc")
                b-icon(icon="chat", pack="mdi")
                span &nbsp;IRC
            a.navbar-item(href="https://steamcommunity.com/groups/metastruct/discussions")
                b-icon(icon="forum")
                span &nbsp;Forums
            a.navbar-item(href="https://github.com/metastruct")
                b-icon(icon="github-circle")
                span &nbsp;GitHub
            a.navbar-item(href="https://gitlab.com/metastruct")
                b-icon(icon="gitlab")
                span &nbsp;GitLab
    .hero
        CyclingBackground(:images="backgrounds")
        .hero-body
            .container

</template>

<style lang="scss" scoped>

@import "@/assets/overrides.scss";

.navbar {
    background-color: rgba(darken($dark, 5%), 0.5);

    .navbar-brand {
        img.navbar-item {
            height: 52px;
        }

        a.navbar-item {
            &:hover {
                background-color: rgba(darken($dark, 10%), 0.75);
            }
        }
    }
}

</style>

<script>

import CyclingBackground from "@/components/CyclingBackground.vue"

export default {
    components: {
        CyclingBackground
    },
    data() {
        return {
            backgrounds: [
                "https://metastruct.net/img/banner/ugly.jpg",
                "https://metastruct.net/img/banner/1.jpg",
                "https://metastruct.net/img/banner/2.jpg",
                "https://metastruct.net/img/banner/3.jpg",
                "https://metastruct.net/img/banner/4.jpg",
                "https://metastruct.net/img/banner/5.jpg",
                "https://metastruct.net/img/banner/6.jpg",
                "https://metastruct.net/img/banner/7.jpg",
                "https://metastruct.net/img/banner/9.jpg"
            ]
        }
    }
}

</script>
