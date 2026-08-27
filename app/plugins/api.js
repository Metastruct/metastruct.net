export default defineNuxtPlugin({
  name: "api",
  setup(nuxtApp) {
    const config = useRuntimeConfig();

    // metaconcord is another host, so its session cookie only rides along with credentials
    const mc = $fetch.create({
      baseURL: config.public.metaconcordUrl,
      credentials: "include",
    });

    nuxtApp.provide("mc", mc);
    // for links and websockets, which cannot go through $mc
    nuxtApp.provide("mcUrl", config.public.metaconcordUrl);
  },
});
