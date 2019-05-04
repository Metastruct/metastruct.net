<template lang="pug">
.timeline-event(:id="id", :key="id", :class="{ 'is-left': index % 2 == 0, 'is-right': index % 2 == 1 }")
    EditButton(v-if="$store.state.user.isAdmin", @start="$emit('wantEdit', _self)")
    .card
        header.card-image.image.is-16by9(v-if="event.imageUrl")
            figure.image
                img(:src="event.imageUrl")
        section.card-content
            h1.title
                nuxt-link.has-text-primary-light(:to="`#${id}`") {{ event.name }}
            p(v-if="event.description", style="white-space: pre-wrap;") {{ event.description }}
            br
            p.is-size-7.has-text-white-ter(:title="event.date.toLocaleDateString('en-US')") {{ event.date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) }}
        footer.card-footer(v-if="event.url")
            a.card-footer-item.has-text-primary(:href="event.url") Read more

</template>

<style lang="scss">
@import "@/assets/_variables.scss";

.timeline-event {
    position: relative;
    width: calc(50% - 1.5em);
    margin-bottom: 3em;

    .timeline-link {
        display: block;
        position: absolute;
        width: 1.5em;
        height: 1.5em;
        top: calc(3em - 1.5em * 0.5);
        color: $primary;
    }

    &.is-left {
        float: left;
        clear: left;
    }

    &.is-right {
        float: right;
        clear: right;
    }

    .card {
        .card-content {
            &.editing {
                padding: 0.75em;
            }
        }

        animation: fade 0.5s ease-out;

        &:empty {
            animation: loading 1s ease-in-out infinite;
        }

        .datepicker {
            margin-bottom: 0;
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

    .edit-button {
        position: absolute;
        top: -0.75em;
        left: 0.75em;
        transform: translateY(-100%);
        z-index: 1;
        transition: opacity 0.25s ease-out 1.5s;
        opacity: 0;
    }

    &:hover {
        .edit-button {
            opacity: 1;
            transition-delay: 0s;
        }
    }
}
</style>

<script>
import EditButton from "@/components/EditButton.vue";

export default {
    props: ["event", "timeline", "index"],
    components: {
        EditButton,
    },
    computed: {
        id() {
            if (this.event && this.event.date) {
                return this.event.date.toISOString().slice(0, 10);
            }
        },
    },
};
</script>

