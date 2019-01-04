<template lang="pug">
#addons
    section.section
        .container
            h1.title.has-text-light Add-ons
            EditButton(v-if="$store.state.user.isAdmin", :editing="editing", @start="startEdits", @save="saveEdits", @cancel="cancelEdits")
            template(v-if="!$store.state.user.isAdmin || !editing")
                .columns.is-multiline
                    .column.is-one-quarter(v-for="addon in addons")
                        a.subtitle.has-text-primary(:href="addon.url").has-text-primary {{ addon.name }}
                        p.has-text-light {{ addon.description }}
            template(v-if="$store.state.user.isAdmin && editing")
                draggable.columns.is-multiline(v-model="editingAddons", :options="sortable", :move="sortable.onMove")
                    .column.is-one-quarter(v-for="(addon, id) in editingAddons", :key="id")
                        .card
                            .card-content
                                a.remove-button.has-text-danger(@click="removeAddon(id)", style="font-size: 0.75rem;") Delete
                                b-field(label="Name", custom-class="is-small")
                                    b-input.name(placeholder="My cool add-on", v-model="addon.name" size="is-medium")
                                b-field(label="URL", custom-class="is-small")
                                    b-input.url(placeholder="https://google.com", v-model="addon.url")
                                b-field(label="Description", custom-class="is-small")
                                    b-input.description(placeholder="Some descriptive text", type="textarea", minlength="0", maxlength="2000", v-model="addon.description")
                    .column.is-one-quarter
                        a.card.add-button(@click="addAddon", tabindex="0")
                            b-icon(icon="plus")

</template>

<script>

import EditButton from "@/components/EditButton.vue"
import draggable from "vuedraggable"
import axios from "axios"

export default {
    components: {
        draggable,
        EditButton
    },
    data() {
        return {
            sortable: {
                filter: ".add-button, .input, .textarea, .remove",
                onMove(evt) {
                    if (evt.related.firstChild.classList.contains("add")) return false
                },
                preventOnFilter: false
            },

            addons: [],
            editingAddons: [],

            editing: false
        }
    },
    async asyncData(ctx) {
        let addons = (await axios.get("/api/v1/addons")).data

        return { addons }
    },
    methods: {
        startEdits() {
            this.editingAddons = this.addons.slice()
            this.editing = true
        },
        saveEdits() {
            this.$axios.post("/api/v1/addons", this.editingAddons)
                .then(() => {
                    this.addons = this.editingAddons
                    this.editing = false
                })
                .catch(console.error)
        },
        cancelEdits() {
            this.editingAddons = this.addons
            this.editing = false
        },
        addAddon() {
            this.editingAddons.push({
                name: "Unnamed",
                description: "Empty description",
                url: "https://google.com",
            })
        },
        removeAddon(id) {
            this.editingAddons.splice(id, 1)
        },
    },
}

</script>

<style lang="scss">

@import "@/assets/_variables.scss";

#addons {
    .title {
        display: inline-block;
        margin-right: 0.25em;
    }

    .card {
        .card-content {
            padding: 0.75em;
        }

        cursor: grab;

        .remove-button {
            padding: inherit;
            text-decoration: none;
            position: absolute;
            top: 0;
            right: 0;
            display: flex;
            align-content: center;
        }
    }

    .field {
        .label {
            cursor: grab;
        }

        .control {
            &.name, &.url {
                .input {
                    color: $primary;
                }
            }
        }
    }

    a.card.add-button {
        cursor: pointer;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;

        .icon {
            transform-origin: center;
            height: 5rem;
            width: 5rem;
            color: rgba(255, 255, 255, 0.25);
            transition: transform 0.1s linear;

            .mdi::before {
                font-size: 96px !important;
            }
        }

        &:hover, &:active, &:focus {
            .icon {
                transform: scale(1.125, 1.125);
            }
        }
    }
}

</style>