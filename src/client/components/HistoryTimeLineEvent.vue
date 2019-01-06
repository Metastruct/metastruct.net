<template lang="pug">
.timeline-event(:id="id", :key="id", :class="{ 'is-left': index % 2 == 0, 'is-right': index % 2 == 1 }")
    EditButton(v-if="$store.state.user.isAdmin", :editing="editing", @start="startEdits", @save="saveEdits", @cancel="cancelEdits", @delete="confirmDelete", showDelete="true")
    //.card(v-observe-visibility="{ callback: observeVisibility, once: true }")
    .card
        template(v-if="isVisible && (!$store.state.user.isAdmin || !editing)")
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
        template(v-if="$store.state.user.isAdmin && editing")
            .card-content.editing
                form(id="edit-history", @submit.prevent="saveEdits")
                    b-field(label="Title", custom-class="is-small")
                        b-input(placeholder="Big bang", v-model="editingEvent.name" size="is-medium")
                    b-field(label="Description", custom-class="is-small")
                        b-input(placeholder="Some descriptive text", type="textarea", minlength="0", maxlength="2000", v-model="editingEvent.description")
                    b-field(label="Image URL", custom-class="is-small")
                        b-input(placeholder="(optional) https://i.imgur.com", v-model="editingEvent.imageUrl")
                    b-field(label="URL (Read more)", custom-class="is-small")
                        b-input(placeholder="(optional) https://google.com", v-model="editingEvent.url")
                    b-field(label="Date", custom-class="is-small")
                        b-datepicker(placeholder="Click to select...", icon="calendar-today", v-model="editingEvent.date", inline)
                button.button.is-hidden(type="submit", form="edit-history")

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

import EditButton from "@/components/EditButton.vue"

export default {
    props: [ "event", "timeline", "index" ],
    components: {
        EditButton
    },
    data() {
        return {
            editingHistory: {},

            editing: false,

            isVisible: true,
        }
    },
    mounted() { },
    methods: {
        /*
        observeVisibility(visible) {
            this.isVisible = visible
        },
        */
        startEdits() {
            this.editingEvent = Object.assign({}, this.event)
            this.editing = true
        },
        saveEdits() {
            this.editing = false
            this.$axios.patch("/api/v1/history", [ this.editingEvent ])
                .then(() => {
                    this.$emit("refresh")
                })
                .catch(console.error)
        },
        cancelEdits() {
            this.editingEvent = this.event
            this.editing = false
        },
        confirmDelete() {
            this.$dialog.confirm({
                message: "Are you sure you want to delete this event?",
                onConfirm: () => {
                    this.editing = false
                    this.$axios.delete("/api/v1/history", { data: [ this.editingEvent ] })
                        .then(() => {
                            this.$emit("refresh")
                        })
                }
            })
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

