const SITE_NAME = "Meta Construct";
const SITE_TAGLINE = "Tinkering games one byte at a time.";
const SITE_DESCRIPTION =
  "We are a gaming community dedicated to research and development of sandbox experiences.";

const isProd = process.env.NODE_ENV === "production";
const METACONCORD_URL = process.env.METACONCORD_URL || "https://metaconcord.metastruct.net";
// Metaconcord scopes its session cookie to .metastruct.net and marks it Secure, so a
// browser on localhost can never send it and there is no way to log in from dev.
// Pasting the cookie here lets the proxy attach it on the way out. Dev only.
const MC_SESSION = !isProd && process.env.MC_SESSION;

if (MC_SESSION) {
  // this session is a real one against the live metaconcord, writes are not sandboxed
  console.warn("[dev] MC_SESSION set: you are logged in against PRODUCTION metaconcord");
}

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
      : {
          "/mc": {
            target: METACONCORD_URL,
            changeOrigin: true,
            ws: true,
            // overwrites the browser's Cookie header, which on localhost is empty anyway
            ...(MC_SESSION ? { headers: { cookie: `ghSession=${MC_SESSION}` } } : {}),
          },
        },
  },

  app: {
    head: {
      // pages override this with "<page> - Meta Construct" through useHead
      title: SITE_NAME,
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { key: "description", name: "description", content: SITE_DESCRIPTION },
        // without these iOS paints the notch and the Safari toolbars light, the
        // colour is $body-background-color from assets/_variables.scss
        { name: "color-scheme", content: "dark" },
        { name: "theme-color", content: "#212121" },
        // link previews
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: SITE_NAME },
        { key: "og:title", property: "og:title", content: `${SITE_NAME} - ${SITE_TAGLINE}` },
        { key: "og:description", property: "og:description", content: SITE_DESCRIPTION },
        { property: "og:image", content: "https://www.metastruct.net/img/logo.png" },
        { name: "twitter:card", content: "summary" },
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

  experimental: {
    // no page uses useAsyncData/useFetch (everything is fetched client-side), so the
    // extracted _payload.json is dead weight and its unused preload warns in the console
    payloadExtraction: false,
  },

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
