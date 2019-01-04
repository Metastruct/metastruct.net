<template lang="pug">
.add-history-modal
    .add-button
        a.has-text-primary(@click="start")
            b-icon(icon="plus")
            span &nbsp;Add
    b-modal(:active.sync="show", has-modal-card)
        .modal-card
            header.modal-card-head
                p.modal-card-title Add Event
            form.modal-card-body(id="add-history", @submit.prevent="confirm")
                b-field(label="Image URL")
                    b-input.imageUrl(placeholder="https://google.com", v-model="newHistory.imageUrl")
                b-field(label="Title")
                    b-input.title(placeholder="Big bang", v-model="newHistory.name" size="is-medium")
                b-field(label="Description")
                    b-input.description(placeholder="Some descriptive text", type="textarea", minlength="0", maxlength="2000", v-model="newHistory.description")
                b-field(label="URL (Details)")
                    b-input.url(placeholder="https://google.com", v-model="newHistory.url")
                b-field(label="Date")
                    b-datepicker.date(placeholder="Click to select...", icon="calendar-today", v-model="newHistory.date", inline)
            .modal-card-foot
                button.button.is-secondary(type="submit", form="add-history")
                    b-icon(icon="check")
                    span &nbsp;Confirm
                button.button(@click="discard")
                    span &nbsp;Close
</template>

<style lang="scss">
.add-history-modal {
    display: inline-block;

    .add-button {
        display: flex;
        align-content: center;

        a {
            display: flex;
            align-content: center;

            margin-left: 0;

            &:not(:first-child) {
                margin-left: 0.5em;
            }
        }
    }
}

</style>


<script>

export default {
    props: [ "history" ],
    data() {
        return {
            show: false,

            newHistory: {
                date: new Date()
            }
        }
    },
    methods: {
        start() {
            this.show = true
        },
        discard() {
            this.show = false
            this.newHistory = {
                date: new Date()
            }
        },
        confirm() {
            this.$axios.post("/api/v1/history", [ this.newHistory ])
                .then(res => {
                    this.show = false
                    this.newHistory = {
                        date: new Date()
                    }
                    let year = new Date(res.data.entries[0].date).getFullYear()
                    this.$emit("refresh", year)
                })
                .catch(console.error)
        },
    }
}

</script>

