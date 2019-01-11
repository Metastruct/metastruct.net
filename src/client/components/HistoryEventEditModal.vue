<template lang="pug">
.history-edit-modal
    b-modal(:active.sync="show", has-modal-card, @close="discard")
        .modal-card
            header.modal-card-head
                b-input.event-title(placeholder="Title", v-model="editingEvent.name" size="is-medium", form="history-edit-modal")
            form.modal-card-body(id="history-edit-modal", @submit.prevent="confirm")
                b-field(label="Description")
                    b-input(placeholder="Some descriptive text", type="textarea", minlength="0", maxlength="2000", v-model="editingEvent.description")
                b-field(label="Date")
                    b-datepicker(placeholder="Click to select...", icon="calendar-today", v-model="date")
                b-field(label="Image URL")
                    b-input(placeholder="(optional) https://i.imgur.com", v-model="editingEvent.imageUrl")
                b-field(label="URL (\"Read more\")")
                    b-input(placeholder="(optional) https://google.com", v-model="editingEvent.url")
            .modal-card-foot.buttons.is-right
                button.button(@click="discard")
                    span Close
                button.button.is-danger(v-if="editing", @click="askDelete")
                    b-icon(icon="delete")
                    span &nbsp;Delete
                button.button.is-primary(type="submit", form="history-edit-modal")
                    b-icon(icon="check")
                    span &nbsp;Confirm
</template>

<style lang="scss">

.history-edit-modal {
    .modal-card .modal-card-head .event-title {
        width: 100%;
    }
}

</style>

<script>

export default {
    props: [ "history" ],
    data() {
        return {
            show: false,
            editing: false,
            adding: false,
            editingEvent: {},
            date: new Date(),
        }
    },
    methods: {
        start(evt) {
            this.show = true
            if (evt) {
                this.editing = true
                this.editingEvent = evt.event
            } else {
                this.adding = true
            }

            this.$nextTick(() => {
                document.querySelector(".modal-card-head input").focus()
            })
        },
        discard() {
            this.show = false
            this.editing = false
            this.adding = false
            this.date = new Date()
            this.editingEvent = {}
        },
        askDelete() {
            this.$dialog.confirm({
                message: "Are you sure you want to delete this event?",
                onConfirm: async () => {
                    await this.$axios.delete("/api/v1/history", { data: [ this.editingEvent ] })
                        .catch(console.error)
                    this.discard()
                    this.$emit("refresh")
                }
            })
        },
        async confirm() {
            this.editingEvent.date = this.date

            let res
            if (this.adding) {
                res = await this.$axios.post("/api/v1/history", [ this.editingEvent ])
                    .catch(console.error)
            } else if (this.editing) {
                res = await this.$axios.patch("/api/v1/history", [ this.editingEvent ])
                    .catch(console.error)
            }

            this.show = false
            this.editing = false
            this.adding = false
            this.editingEvent = {}
            let year = new Date(res.data.entries[0].date).getFullYear()
            this.$emit("refresh", year)
        },
    }
}

</script>

