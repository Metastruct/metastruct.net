<template lang="pug">

.card.server-info
    .background-container
        .background
    .card-content(@mousedown="startJoin", @mouseup="endJoin")
        p.title.has-text-primary-light {{ idToName[id] || id }}
        p.subtitle
            | {{ server.playerinfo.length > 0 ?
            |       server.playerinfo.length + (" player" + (server.playerinfo.length != 1 ? "s" : "")) :
            |       "Empty,"
            | }} on {{ server.serverinfo.map }}
            br
            | {{ ((server.time - server.started) / 60 / 60).toFixed(1) }} hours uptime
        ul.playerlist(v-if="server.playerinfo.length > 0", @mousedown.stop, @mouseup.stop)
            li.player(v-for="player in server.playerinfo", :class="{ 'is-admin': player.IsAdmin }")
                a(title="View profile", :href="`https://steamcommunity.com/profiles/[U:1:${player.AccountID}]`", target="_blank")
                    img.avatar(:src="player.avatarfull")
                    span.nick {{ player.Nick }}
                a.join-goto(:title="'Join and go to ' + player.Nick", :href="`steam://connect/${server.serverinfo.address}:${server.serverinfo.port}/GO:_${player.EntIndex}`")
                    b-icon(icon="arrow-right", type="is-success")
        .server-info-bottom
            a.has-text-primary-light Join us!

</template>

<style lang="scss">
	.card.server-info {
		cursor: pointer;
		position: relative;
		z-index: 0;

		.background-container {
			position: absolute;
			z-index: -1;
			left: 0;
			right: 0;
			top: 0;
			height: calc(100% + 1px);
			clip-path: inset(0px 0px 0px 0px);

			.background {
				position: absolute;
				top: 0;
				bottom: 0;
				left: 0;
				right: 0;
				background: linear-gradient(0deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
					url("/img/gm_construct_m.jpg");
				background-size: cover;
				background-position: center center;
				filter: brightness(100%) blur(3px);
				transform-origin: center;
				transition: margin 0.25s ease-out, filter 0.25s ease-out;
			}
		}

		&:hover,
		&:active,
		&:focus {
			.background {
				filter: brightness(125%) blur(0px);
				margin: -8px;
			}
		}

		.card-content {
			display: flex;
			flex-direction: column;
			height: 100%;

			.playerlist {
				cursor: default;
				margin: auto 0;
				padding: 0.75em;
				background: rgba($grey-darker, 0.36);
				max-height: 184px;
				// height: 156px;
				overflow-y: auto;
				color: $light;
				align-content: center;

				.player {
					width: 100%;
					display: flex;
					align-content: center;

					a {
						text-decoration: none;
						display: flex;
						align-content: center;

						&:hover,
						&:active,
						&:focus {
							filter: brightness(75%);
						}

						.nick {
							display: inline-block;
							font-size: 0.9em;
							color: $info;
						}

						.avatar {
							height: 20px;
							border-radius: 50%;
							margin-right: 0.33em;
						}
					}

					&.is-admin a .nick {
						color: lighten(adjust-hue($info, 80), 5%) !important;
					}

					.join-goto {
						margin-left: auto;
					}

					&:not(:last-child) {
						margin-bottom: 0.25em;
					}
				}
			}

			.server-info-bottom {
				display: flex;
				justify-content: space-around;
				font-size: 1.5em;
				margin-top: 1.5rem;
			}

			.subtitle + .server-info-bottom {
				// In case playerlist does not show up
				margin-top: auto !important;
			}
		}
	}
</style>

<script>
	export default {
		props: ["server", "id"],
		data() {
			return {
				idToName: {
					eu1: "Europe #1",
					eu2: "Europe #2",
					us1: "United States #1",
				},
				mX: null,
				mY: null,
			};
		},
		methods: {
			startJoin(ev) {
				[this.mX, this.mY] = [ev.x, ev.y];
			},
			endJoin(ev) {
				if (this.mX - ev.x === 0 && this.mY - ev.y === 0)
					window.open(
						`steam://connect/${this.server.serverinfo.address}:${this.server.serverinfo.port}`,
						"_blank"
					);
			},
		},
	};
</script>
