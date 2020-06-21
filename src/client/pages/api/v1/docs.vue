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
                    code.has-text-white-ter ADMIN
                    |
                    | endpoints are reserved for logged-in developers only.
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
                                    code.has-text-secondary(v-if="endpoint.method == 'PATCH'") {{ endpoint.method }}
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
		asyncData({ req }) {
			return {
				location: req ? req.headers.host : window.location.hostname,
			};
		},
		data() {
			return {
				endpoints: [
					{
						path: "/servers",
						method: "GET",
						description:
							"Retrieves info about all online Meta Construct servers.",
					},
					{
						path: "/addons",
						method: "GET",
						description:
							"Retrieves all info about add-ons displayed on the site.",
					},
					{
						path: "/addons",
						method: "POST",
						description:
							"Manages creation, modification and deletion of add-ons.",
						parameters: [
							{
								type: "Array",
								name: "addons",
								description: "An array of add-on entries.",
							},
						],
						adminOnly: true,
					},
					{
						path: "/history",
						method: "GET",
						description:
							"Retrieves the history of Meta Construct, in data form.",
					},
					{
						path: "/history",
						method: "POST",
						description: "Creates new history event entries.",
						parameters: [
							{
								type: "Array",
								name: "event",
								description: "An array of event entries.",
							},
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
								description: "An array of event entries.",
							},
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
								description: "An array of event entries.",
							},
						],
						adminOnly: true,
					},
					{
						path: "/auth",
						method: "GET",
						description:
							"Retrieves info about the logged-in Steam user.",
					},
				],

				location: null,
			};
		},
		methods: {
			getEndpointId(endpoint) {
				return endpoint.method + "-" + endpoint.path.substr(1);
			},
		},
		head() {
			return {
				title: "API Documentation - Meta Construct",
			};
		},
	};
</script>
