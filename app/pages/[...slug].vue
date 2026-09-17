<template>
  <div id="redirect">
    <section class="section">
      <div class="container is-max-desktop">
        <template v-if="target">
          <h1 class="title">Redirecting…</h1>
          <p class="subtitle is-6">
            Taking you to <a :href="target">{{ target }}</a
            >. Nothing happening? Follow the link.
          </p>
        </template>
        <template v-else>
          <h1 class="title">Not found</h1>
          <p class="subtitle is-6">
            There is nothing at <span class="path">{{ $route.path }}</span
            >.
          </p>
          <nuxt-link class="button is-primary" to="/">Back to the home page</nuxt-link>
        </template>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  setup() {
    const route = useRoute();
    const target = computed(() => resolveShortLink(route.path));

    useHead(() => ({
      title: target.value ? "Redirecting - Meta Construct" : "Not found - Meta Construct",
      meta: target.value ? [{ "http-equiv": "refresh", content: `0; url=${target.value}` }] : [],
    }));

    // replace rather than assign, so back does not land on this page again
    onMounted(() => {
      if (target.value) window.location.replace(target.value);
    });

    return { target };
  },
};
</script>

<style lang="scss">
#redirect {
  .path {
    font-family: monospace;
    word-break: break-all;
  }
}
</style>
