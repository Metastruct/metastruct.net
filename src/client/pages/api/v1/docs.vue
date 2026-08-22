<template lang="pug">
#docs
  section.section
    .container
      .content
        h1 API Documentation
        p
          | All of these endpoints are served by
          |
          a(href="https://github.com/Metastruct/node-metaconcord") metaconcord
          |
          | at
          |
          code {{ location }}
          | .
        p
          code.has-text-white-ter ADMIN
          |
          | endpoints are reserved for logged-in Metastruct developers (GitHub login) and commit to the
          |
          a(href="https://github.com/Metastruct/history") history repo
          | .
        p
          | All data is represented in
          |
          code json
          | .
        p
          | You should probably look at the format of our data via
          |
          code.has-text-info GET
          |
          | requests before touching anything.
        hr.divider
        .columns.is-multiline
          .column.is-one-quarter(v-for="endpoint in endpoints")
            .card
              h3(:id="`${getEndpointId(endpoint)}`")
                nuxt-link(:to="`#${getEndpointId(endpoint)}`")
                  code {{ endpoint.path }}
                  code.has-text-info(v-if="endpoint.method == 'GET'") {{ endpoint.method }}
                  code.has-text-success(v-if="endpoint.method == 'POST'") {{ endpoint.method }}
                  code.has-text-secondary(v-if="endpoint.method == 'PUT'") {{ endpoint.method }}
                  code.has-text-danger(v-if="endpoint.method == 'DELETE'") {{ endpoint.method }}
                  code.has-text-white-ter(v-if="endpoint.adminOnly") ADMIN
              p {{ endpoint.description }}
              template(v-if="endpoint.parameters")
                h5 Parameters
                ul
                  li(v-for="param in endpoint.parameters")
                    code {{ param.type }}
                    |
                    |
                    span {{ param.name }}
                    p {{ param.description }}
</template>

<style lang="scss">
#docs {
  .card {
    padding: 1.5em;
    height: 100%;
  }
}
</style>

<script>
export default {
  data() {
    return {
      location: this.$config.metaconcordUrl,
      endpoints: [
        {
          path: "/servers",
          method: "GET",
          description:
            "Retrieves the online servers and instances of every game, grouped by game, with players.",
        },
        {
          path: "/addons",
          method: "GET",
          description:
            "Retrieves the add-ons, workshop items and mods running on each server, grouped by server.",
        },
        {
          path: "/addons/:game/:id",
          method: "GET",
          description: "Retrieves the add-on list of a single server.",
        },
        {
          path: "/join/:label",
          method: "GET",
          description:
            "Redirects to a steam://connect link for a Garry's Mod server (eu1, us1...).",
          parameters: [
            {
              type: "String",
              name: "pwd",
              description: "Optional server password, as a query string or extra path segment.",
            },
          ],
        },
        {
          path: "/auth/me",
          method: "GET",
          description: "Retrieves info about the logged-in GitHub user.",
        },
        {
          path: "/history/events",
          method: "POST",
          description:
            "Adds a history event. The public data lives in the history repo as history.json.",
          parameters: [
            {
              type: "Object",
              name: "event",
              description: "{ name, description, date (YYYY-MM-DD), url?, imageUrl? }",
            },
          ],
          adminOnly: true,
        },
        {
          path: "/history/events/:id",
          method: "PUT",
          description: "Replaces an existing history event.",
          parameters: [
            {
              type: "Object",
              name: "event",
              description: "{ name, description, date (YYYY-MM-DD), url?, imageUrl? }",
            },
          ],
          adminOnly: true,
        },
        {
          path: "/history/events/:id",
          method: "DELETE",
          description: "Deletes a history event.",
          adminOnly: true,
        },
      ],
    };
  },
  head() {
    return {
      title: "API Documentation - Meta Construct",
    };
  },
  methods: {
    getEndpointId(endpoint) {
      return endpoint.method + "-" + endpoint.path.substr(1);
    },
  },
};
</script>
