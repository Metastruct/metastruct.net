import pkg from "./package.json";

const isProd = process.env.NODE_ENV === "production";
const METACONCORD_URL = process.env.METACONCORD_URL || "https://metaconcord.metastruct.net";

export default defineNuxtConfig({
  compatibilityDate: "2025-08-27",

  devServer: {
    port: 20000,
    host: "0.0.0.0",
  },

  // in dev, metaconcord is reached through the nitro proxy so its session cookie stays first-party
  runtimeConfig: {
    public: {
      metaconcordUrl: isProd ? METACONCORD_URL : "/mc",
    },
  },

  nitro: {
    devProxy: isProd
      ? {}
      : { "/mc": { target: METACONCORD_URL, changeOrigin: true, ws: true } },
  },

  app: {
    head: {
      title: pkg.name,
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { key: "description", name: "description", content: pkg.description },
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
  },

  css: ["~/assets/style.scss"],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // replaces @nuxtjs/style-resources: component <style> blocks reference
          // the palette without importing it
          additionalData: '@import "~/assets/_variables.scss";',
          // bulma 0.9 and its color helpers predate the sass module system
          silenceDeprecations: ["import", "global-builtin", "color-functions", "slash-div"],
        },
      },
    },
  },

  eslint: {
    config: {
      stylistic: false,
    },
  },

  modules: ["@nuxt/eslint"],

  telemetry: false,
});
