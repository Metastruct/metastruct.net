<template lang="pug">
.timeline-event(:id="id", :key="id", :class="{ 'is-left': index % 2 == 0, 'is-right': index % 2 == 1 }")
    .card(v-observe-visibility="{ callback: observeVisibility, once: true }")
        template(v-if="isVisible && (!$store.state.user.isAdmin || !editing)")
            header.card-image(v-if="event.imageUrl")
                figure.image
                    img(:src="event.imageUrl")
            section.card-content
                p.title {{ event.name }}
                p {{ event.description }}
                p.is-size-7.has-text-white-ter {{ event.date.toLocaleDateString() }}
                EditButton(v-if="$store.state.user.isAdmin", :editing="editing", @start="startEdits", @save="saveEdits", @cancel="cancelEdits", @delete="confirmDelete", showDelete="true")
            footer.card-footer(v-if="event.url")
                a.card-footer-item.has-text-primary(:href="event.url") Read more
        template(v-if="$store.state.user.isAdmin && editing")
            .card-content
                b-field(label="Image URL", custom-class="is-small")
                    b-input.imageUrl(placeholder="https://google.com", v-model="editingEvent.imageUrl")
                b-field(label="Title", custom-class="is-small")
                    b-input.title(placeholder="Big bang", v-model="editingEvent.name" size="is-medium")
                b-field(label="Description", custom-class="is-small")
                    b-input.description(placeholder="Some descriptive text", type="textarea", minlength="0", maxlength="2000", v-model="editingEvent.description")
                b-field(label="URL (Details)", custom-class="is-small")
                    b-input.url(placeholder="https://google.com", v-model="editingEvent.url")
                b-field(label="Date")
                    b-datepicker.date(placeholder="Click to select...", icon="calendar-today", v-model="editingEvent.date", inline)
                EditButton(v-if="$store.state.user.isAdmin", :editing="editing", @start="startEdits", @save="saveEdits", @cancel="cancelEdits", @delete="confirmDelete", showDelete="true")
    a.timeline-link(:href="`#${id}`")
        b-icon(icon="radiobox-marked")

</template>

<style lang="scss">

@import "@/assets/_variables.scss";

.timeline-event {
    position: relative;
    width: calc(50% - 1.5em);

    .edit-button {
        margin-top: 1.5em;
    }

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

            isVisible: false,
        }
    },
    mounted() { },
    methods: {
        observeVisibility(visible) {
            this.isVisible = visible
        },
        startEdits() {
            this.editingEvent = Object.assign({}, this.event)
            this.editing = true
        },
        saveEdits() {
            this.$axios.patch("/api/v1/history", [ this.editingEvent ])
                .then(() => {
                    this.event = this.editingEvent
                    this.editing = false
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
                            this.$emit("deleted")
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

