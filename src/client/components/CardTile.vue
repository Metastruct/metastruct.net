<template lang="pug">
.card-tile.is-child.card.tile(:is="is", :to="to", :href="href")
    .card-content
        .icon-background(v-if="data.icon")
            b-icon(:icon="data.icon")
        p.title.has-text-primary-light {{ data.title }}
        p.subtitle {{ data.subtitle }}
</template>

<style lang="scss">
a.card.tile.card-tile {
    .icon-background {
        .icon {
            transition: transform 0.1s linear;
        }
    }

    &:hover,
    &:active,
    &:focus {
        .icon-background {
            .icon {
                transform: scale(1.125, 1.125);
            }
        }
    }

    .card-content {
        padding-right: 25%;

        .icon-background {
            position: absolute;
            display: flex;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 1.5rem;
            justify-content: flex-end;
            align-items: flex-end;

            .icon {
                transform-origin: center;
                height: 5rem;
                width: 5rem;
                color: rgba(255, 255, 255, 0.25);

                .mdi::before {
                    font-size: 86px !important;
                }
            }
        }
    }
}
</style>

<script>
export default {
    props: ["data"],
    computed: {
        is() {
            if (this.data.path.substr(0, 1) == "/") {
                return "nuxt-link";
            }
            return "a";
        },
        to() {
            if (this.is == "nuxt-link" || (this.$el && this.$el.tagName.toLowerCase() != "a")) {
                return this.data.path;
            }
        },
        href() {
            return this.data.path;
        },
    },
};
</script>
