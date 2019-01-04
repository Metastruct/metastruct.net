const pkg = require("./package")

module.exports = {
    mode: "universal",

    /*
    ** Headers of the page
    */
    head: {
        title: pkg.name,
        meta: [
            { charset: "utf-8" },
            { name: "viewport", content: "width=device-width, initial-scale=1" },
            { hid: "description", name: "description", content: pkg.description }
        ],
        link: [
            { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
            { rel: "stylesheet", href: "//cdn.materialdesignicons.com/3.2.89/css/materialdesignicons.min.css" }
        ],
        htmlAttrs: {
            class: "has-background-dark"
        }
    },

    /*
    ** Customize the progress-bar color
    */
    loading: { color: "#fff" },

    /*
    ** Global CSS
    */
    css: [
        "@/assets/style.scss",
    ],

    /*
    ** Plugins to load before mounting the App
    */
    plugins: [
        "@/plugins/buefy.js",
        "@/plugins/vue-observe-visibility.js"
    ],

    /*
    ** Nuxt.js modules
    */
    modules: [
        // Doc: https://github.com/nuxt-community/axios-module#usage
        "@nuxtjs/axios",
        // Doc: https://buefy.github.io/#/documentation
        // "nuxt-buefy"
    ],
    /*
    ** Axios module configuration
    */
    axios: {
        // See https://github.com/nuxt-community/axios-module#options
    },

    router: {
        scrollBehavior(to) {
            if (to.hash && to.hash != "#") {
                return window.scrollTo({ top: document.getElementById(to.hash.substr(1)).offsetTop, behavior: "smooth" })
            }
            return window.scrollTo({ top: 0, behavior: "smooth" })
        }
    },

    /*
    ** Build configuration
    */
    build: {
        /*
        ** You can extend webpack config here
        */
        extend(config, ctx) {

        }
    },

    srcDir: "src/client",
}
