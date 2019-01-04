<template lang="pug">
.timeline-event(:id="id", :key="id", :class="{ 'is-left': index % 2 == 1, 'is-right': index % 2 == 0 }")
    .card(v-observe-visibility="{ callback: observeVisibility, once: true }")
        template(v-if="isVisible")
            .card-image(v-if="event.imageUrl")
                figure.image
                    img(:src="event.imageUrl")
            .card-content
                p.title {{ event.name }}
                p {{ event.description }}
            .card-footer(v-if="event.url")
                a.card-footer-item.has-text-primary(:href="event.url") Read more
    a.timeline-link(:href="`#${id}`")
        b-icon(icon="radiobox-marked")

</template>

<style lang="scss">

@import "@/assets/overrides.scss";

.timeline-event {
    position: relative;
    width: calc(50% - 1.5em);

    .timeline-link {
        display: block;
        position: absolute;
        width: 1.5em;
        height: 1.5em;
        top: calc(3em - 1.5em * 0.5);
        color: $primary;
    }

    &::before {
        box-shadow: 0px 0px 12px darken($dark, 5%);
        position: absolute;
        content: "";
        top: 3em;
        height: 3px;
        width: 1.5em;
        background: lighten($dark, 20%);
    }

    &.is-right {
        float: right;
        clear: right;
        margin: 3em 0;

        .timeline-link {
            right: auto;
            left: calc(-1.5em * 1.5);
        }

        &::before {
            right: auto;
            left: -1.5em;
        }
    }

    &.is-left {
        float: left;
        clear: left;
        margin-bottom: 3em;

        .timeline-link {
            left: auto;
            right: calc(-1.5em * 1.5);
        }

        &::before {
            right: -1.5em;
            left: auto;
        }
    }

    /*
    &:nth-of-type(2n+1) {
        margin-top: 3em;
    }
    */

    .card {
        animation: fade 0.5s ease-out;

        &:empty {
            animation: loading 1s ease-in-out infinite;
        }
    }

    @keyframes fade {
        0% {
            opacity: 0;
        }

        100% {
            opacity: 1;
        }
    }

    @keyframes loading {
        0% {
            opacity: 1;
        }

        50% {
            opacity: 0.5;
        }

        100% {
            opacity: 1;
        }
    }
}

</style>

<script>

export default {
    props: [ "event", "timeline", "index" ],
    data() {
        return {
            isVisible: false,
        }
    },
    mounted() { },
    methods: {
        observeVisibility(visible) {
            this.isVisible = visible
        }
    },
    computed: {
        id() {
            if (this.event && this.event.date) {
                return this.event.date.toISOString().slice(0, 10)
            }
        }
    }
}

</script>

