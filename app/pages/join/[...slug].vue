<template>
  <div id="join">
    <section class="section">
      <div class="container is-max-desktop">
        <h1 class="title">{{ server || "Joining" }}</h1>
        <MessageBox v-if="error" type="is-danger" has-icon>
          {{ error }}
          <nuxt-link to="/">Back to the home page</nuxt-link>.
        </MessageBox>
        <MessageBox v-else-if="!url">Looking up the server…</MessageBox>
        <MessageBox v-else type="is-info" has-icon>
          Handing you over to Garry's Mod. Nothing happening?
          <a :href="url">Connect to {{ address }}</a
          >.
        </MessageBox>
      </div>
    </section>
  </div>
</template>

<script>
const DEFAULT_PASSWORD = "metawebsite";
const PASSWORD_ALLOWED = /[^a-zA-Z*0-9:+\-\s]+/g;

export default {
  setup() {
    useHead({ title: "Join - Meta Construct" });
  },
  data() {
    return { url: null, address: null, server: null, error: null };
  },
  mounted() {
    this.resolve();
  },
  methods: {
    async resolve() {
      const [label, pwd] = this.$route.params.slug ?? [];
      if (!label) {
        this.error = "No server given, the link should look like /join/eu1.";
        return;
      }

      let games;
      try {
        ({ games } = await this.$mc("/servers"));
      } catch (err) {
        console.error("join", err);
        this.error = `Could not reach the server list to look up ${label}.`;
        return;
      }

      const wanted = label.toLowerCase();
      const entry = (games ?? [])
        .find(game => game.game === "gmod")
        ?.entries.find(
          e => e.connect?.label?.toLowerCase() === wanted || e.name?.toLowerCase() === wanted
        );
      if (!entry) {
        this.error = `No Garry's Mod server called ${label} is online right now.`;
        return;
      }

      const host = entry.connect?.ip || entry.connect?.address;
      const port = entry.connect?.port;
      if (!host || !port) {
        this.error = `${entry.name} has no public address to connect to.`;
        return;
      }

      const password = String(pwd || this.$route.query.pwd || DEFAULT_PASSWORD).replace(
        PASSWORD_ALLOWED,
        ""
      );
      this.address = `${host}:${port}`;
      this.server = entry.name || label;
      this.url = `steam://connect/${this.address}/${password}`;
      window.location.replace(this.url);
    },
  },
};
</script>
