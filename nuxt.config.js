const pkg = require("./package");

module.exports = {
  // mode: "universal",

  server: {
    port: 20080, // default: 3000
    host: "0.0.0.0", // default: localhost
  },

  /*
   ** Headers of the page
   */
  head: {
    title: pkg.name,
    meta: [
      { charset: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        hid: "description",
        name: "description",
        content: pkg.description,
      },
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      {
        rel: "stylesheet",
        href: "//cdn.materialdesignicons.com/3.2.89/css/materialdesignicons.min.css",
      },
    ],
    htmlAttrs: {
      class: "has-background-dark",
    },
  },

  /*
   ** Customize the progress-bar color
   */
  loading: {
    color: "#0ce3ac",
  },

  /*
   ** Global CSS
   */
  css: ["@/assets/style.scss"],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    "@/plugins/buefy.js",
    "@/plugins/vue-observe-visibility.js",
    "@/plugins/prototype-extensions.js",
    { src: "@/plugins/axios-baseurl-location.js", ssr: false },
  ],

  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://github.com/nuxt-community/axios-module#usage
    "@nuxtjs/axios",
    // Doc: https://buefy.github.io/#/documentation
    // "nuxt-buefy"
    "@nuxtjs/style-resources",
  ],

  styleResources: {
    scss: "@/assets/_variables.scss",
  },

  /*
   ** Axios module configuration
   */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
    baseURL: `http://localhost:${
      process.env.PORT || (process.env.NODE_ENV === "production" ? 20080 : 3000)
    }`,
    // browserBaseURL: "//metastruct.net/"
  },

  /*
   ** Build configuration
   */

  /*
	buildDir: "_nuxt",
	*/
  // build: {
  // 	extend(config, ctx) {
  // 		// Run ESLint on save
  // 		if (ctx.isDev && ctx.isClient) {
  // 			config.module.rules.push({
  // 				enforce: "pre",
  // 				test: /\.(js|vue)$/,
  // 				loader: "eslint-loader",
  // 				exclude: /(node_modules|dist)/,
  // 			});
  // 		}
  // 	},
  // },

  srcDir: "src/client",

  telemetry: false,
};
