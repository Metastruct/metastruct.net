const pkg = require("./package");

const isProd = process.env.NODE_ENV === "production";
const METACONCORD_URL = process.env.METACONCORD_URL || "https://metaconcord.metastruct.net";

module.exports = {
  target: "static",

  server: {
    port: 20000,
    host: "0.0.0.0",
  },

  // in dev, metaconcord is reached through the nuxt proxy so its session cookie stays first-party
  publicRuntimeConfig: {
    metaconcordUrl: isProd ? METACONCORD_URL : "/mc",
  },

  proxy: isProd
    ? {}
    : { "/mc/": { target: METACONCORD_URL, pathRewrite: { "^/mc/": "/" }, ws: true } },

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
    "@/plugins/auth.client.js",
  ],

  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://github.com/nuxt-community/axios-module#usage
    "@nuxtjs/axios",
    "@nuxtjs/proxy",
    // Doc: https://buefy.github.io/#/documentation
    // "nuxt-buefy"
    "@nuxtjs/style-resources",
  ],

  styleResources: {
    scss: "@/assets/_variables.scss",
  },

  /*
   ** Build configuration
   */

  /*
	buildDir: "_nuxt",
	*/
  build: {
    // xterm ships syntax webpack 4 can't parse, run it through babel
    transpile: ["@xterm/xterm", "@xterm/addon-fit"],
    loaders: {
      vue: {
        // drop inter-tag whitespace like pug did (and like Vue 3 does by default),
        // so icon/label spacing stays controlled by the explicit &nbsp; entities
        compilerOptions: { whitespace: "condense" },
      },
    },
  },

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
