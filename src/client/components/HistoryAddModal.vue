<template lang="pug">
.history-add
    b-modal(:active.sync="show", has-modal-card)
        .modal-card
            header.modal-card-head
                p.modal-card-title Add Event
            form.modal-card-body(id="add-history", @submit.prevent="confirm")
                b-field.title-focus(label="Title")
                    b-input(placeholder="Big bang", v-model="newHistory.name" size="is-medium")
                b-field(label="Description")
                    b-input(placeholder="Some descriptive text", type="textarea", minlength="0", maxlength="2000", v-model="newHistory.description")
                .columns
                    .column
                        b-field(label="Date")
                            b-datepicker(placeholder="Click to select...", icon="calendar-today", v-model="date", inline)
                    .column
                        b-field(label="Image URL")
                            b-input(placeholder="(optional) https://i.imgur.com", v-model="newHistory.imageUrl")
                        b-field(label="URL (Read more)")
                            b-input(placeholder="(optional) https://google.com", v-model="newHistory.url")
            .modal-card-foot
                button.button.is-secondary(type="submit", form="add-history")
                    b-icon(icon="check")
                    span &nbsp;Confirm
                button.button(@click="discard")
                    span &nbsp;Close
</template>

<script>

export default {
    props: [ "history" ],
    data() {
        return {
            show: false,
            date: new Date(),
            newHistory: {}
        }
    },
    methods: {
        start() {
            this.show = true
            this.$nextTick(() => {
                document.querySelector(".title-focus input").focus()
            })
        },
        discard() {
            this.show = false
            this.date = new Date()
            this.newHistory = {}
        },
        confirm() {
            this.newHistory.date = this.date
            this.$axios.post("/api/v1/history", [ this.newHistory ])
                .then(res => {
                    this.show = false
                    this.newHistory = {}
                    let year = new Date(res.data.entries[0].date).getFullYear()
                    this.$emit("refresh", year)
                })
                .catch(console.error)
        },
    }
}

</script>

