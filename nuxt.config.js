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
            class: "has-background-dark has-text-light has-fixed-navbar-top"
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
        "@/plugins/buefy.js"
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
