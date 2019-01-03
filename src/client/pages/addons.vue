<template lang="pug">
#addons
    section.section
        .container
            .editing(v-if="$store.state.user.isAdmin")
                a.has-text-secondary(v-if="!editing", @click="startEdits")
                    b-icon(icon="pencil")
                    span &nbsp;Edit
                template(v-else)
                    a.has-text-secondary(@click="saveEdits")
                        b-icon(icon="content-save")
                        span &nbsp;Save
                    a.has-text-secondary(@click="cancelEdits")
                        b-icon(icon="cancel")
                        span &nbsp;Cancel
            .columns.is-multiline
                template(v-if="!$store.state.user.isAdmin || !editing")
                    .column.is-one-quarter(v-for="addon in receivedAddons")
                        p.title
                            a(:href="addon.url").has-text-primary {{ addon.name }}
                        p.subtitle.has-text-light {{ addon.description }}
                template(v-if="$store.state.user.isAdmin && editing")
                    .column.is-one-quarter(v-for="(addon, i) in editingAddons")
                        .notification
                            a.remove.has-text-danger(@click="removeAddon(i)")
                                b-icon(icon="delete")
                                span &nbsp;Delete
                            b-field(label="Addon name")
                                b-input.name(placeholder="Addon name", v-model="addon.name" size="is-large")
                            b-field(label="Addon URL")
                                b-input.url(placeholder="Addon URL", v-model="addon.url")
                            b-field(label="Addon description")
                                b-input.description(placeholder="Addon description", type="textarea", minlength="0", maxlength="2000", v-model="addon.description")
                    .column.is-one-quarter
                        a.notification.add(@click="addAddon")
                            b-icon(icon="plus")

</template>

<style lang="scss">

@import "@/assets/overrides.scss";

#addons {
    .editing {
        display: flex;
        align-content: center;
        position: absolute;
        top: -1.5em;
        right: 1.5em;

        a {
            margin-left: 1em;
            display: flex;
            align-content: center;
        }
    }

    .notification {
        .remove {
            text-decoration: none;
            position: absolute;
            top: 1.5em;
            right: 1.5em;
            display: flex;
            align-content: center;
        }

        .field {
            .label {
                color: $light;
            }

            .control {
                input, textarea {
                    background: $dark;
                    padding: 0.5em;
                    border: lighten($dark, 5%);
                    color: $light;

                    &:active, &:focus {
                        border-color: $secondary;
                        box-shadow: 0 0 0 0.125em darken($secondary, 15%);
                    }
                }

                &.name, &.url {
                    input {
                        color: $primary;
                    }
                }
            }
        }
    }

    a.notification.add {
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

        &:hover {
            .icon {
                transform: scale(1.125, 1.125);
            }
        }
    }
}

</style>

<script>

import axios from "axios"

export default {
    data() {
        return {
            receivedAddons: [],
            editingAddons: [],

            editing: false
        }
    },
    async asyncData(ctx) {
        let receivedAddons = (await axios.get("http://new.metastruct.net:3000/addons.json")).data

        return { receivedAddons }
    },
    methods: {
        startEdits() {
            this.editingAddons = this.receivedAddons.slice()
            this.editing = true
        },
        saveEdits() {
            axios.post("http://new.metastruct.net:3000/addons.json", this.editingAddons)
                .then(() => {
                    this.receivedAddons = this.editingAddons
                    this.editing = false
                })
                .catch(console.error)
        },
        cancelEdits() {
            this.editingAddons = this.receivedAddons
            this.editing = false
        },
        addAddon() {
            this.editingAddons.push({
                name: "Unnamed",
                description: "Empty description",
                url: "https://google.com"
            })
        },
        removeAddon(id) {
            this.editingAddons.splice(id, 1)
        },
    },
}

</script>
