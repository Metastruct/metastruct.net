<template lang="pug">
#docs
    section.section
        .container
            .content
                h1 API Documentation
                p
                    | All of these endpoints are preceded by
                    |
                    code /api/v1
                    |
                    | and accessible from
                    |
                    code {{ location }}
                    | .
                p
                    code.has-background-warning.has-text-dark ADMIN
                    |
                    | endpoints are reserved for logged-in users only.
                p
                    | All data is represented in
                    |
                    code json
                    | .
                p
                    | You should probably look at the format of our data via
                    |
                    code.has-background-info.has-text-light GET
                    |
                    | requests before touching anything.
                hr.divider
                .columns.is-multiline
                    .column(v-for="endpoint in endpoints")
                        h3(:id="`${getEndpointId(endpoint)}`")
                            nuxt-link(:to="`#${getEndpointId(endpoint)}`")
                                code.has-background-warning.has-text-dark(v-if="endpoint.adminOnly") ADMIN
                                code.has-background-info.has-text-light(v-if="endpoint.method == 'GET'") {{ endpoint.method }}
                                code.has-background-primary.has-text-light(v-if="endpoint.method == 'POST'") {{ endpoint.method }}
                                code.has-background-secondary.has-text-light(v-if="endpoint.method == 'PATCH'") {{ endpoint.method }}
                                code.has-background-danger.has-text-light(v-if="endpoint.method == 'DELETE'") {{ endpoint.method }}
                                code {{ endpoint.path }}
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
    .columns {
        flex-direction: column;
        height: 640px;
    }
}
</style>

<script>

export default {
    head() {
        return {
            title: "API Documentation - Meta Construct"
        }
    },
    data() {
        return {
            endpoints: [
                {
                    path: "/servers",
                    method: "GET",
                    description: "Retrieves info about all online Meta Construct servers."
                },
                {
                    path: "/addons",
                    method: "GET",
                    description: "Retrieves all info about add-ons displayed on the site."
                },
                {
                    path: "/addons",
                    method: "POST",
                    description: "Manages creation, updating and deletion of add-ons.",
                    parameters: [
                        {
                            type: "Array",
                            name: "addons",
                            description: "An array of add-on entries."
                        }
                    ],
                    adminOnly: true,
                },
                {
                    path: "/history",
                    method: "GET",
                    description: "Retrives the history of Meta Construct, in data form.",
                },
                {
                    path: "/history",
                    method: "POST",
                    description: "Creates new history event entries.",
                    parameters: [
                        {
                            type: "Array",
                            name: "event",
                            description: "An array of event entries."
                        }
                    ],
                    adminOnly: true,
                },
                {
                    path: "/history",
                    method: "PATCH",
                    description: "Updates existing history event entries.",
                    parameters: [
                        {
                            type: "Array",
                            name: "event",
                            description: "An array of event entries."
                        }
                    ],
                    adminOnly: true,
                },

                {
                    path: "/history",
                    method: "DELETE",
                    description: "Deletes existing history event entries.",
                    parameters: [
                        {
                            type: "Array",
                            name: "event",
                            description: "An array of event entries."
                        }
                    ],
                    adminOnly: true,
                },
                {
                    path: "/auth/info",
                    method: "GET",
                    description: "Retrieves info about the logged-in Steam user."
                },
            ],

            location: null,
        }
    },
    asyncData({ req }) {
        return { location: req ? req.headers.host : window.location.hostname }
    },
    methods: {
        getEndpointId(endpoint) {
            return endpoint.method + '-' + endpoint.path.substr(1)
        }
    }
}

</script>

