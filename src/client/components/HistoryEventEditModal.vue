<template lang="pug">
.history-edit-modal
  b-modal(:active.sync="show", has-modal-card, @close="discard")
    .modal-card
      header.modal-card-head
        b-input.event-title(
          placeholder="Title",
          v-model="editingEvent.name",
          size="is-medium",
          form="history-edit-modal"
        )
      form#history-edit-modal.modal-card-body(@submit.prevent="confirm")
        b-field(label="Description")
          b-input(
            placeholder="Some descriptive text",
            type="textarea",
            minlength="0",
            maxlength="2000",
            v-model="editingEvent.description"
          )
        b-field(label="Date")
          b-datepicker(
            placeholder="Click to select...",
            icon="calendar-today",
            v-model="editingEvent.date"
          )
        b-field(label="Image URL")
          b-input(placeholder="(optional) https://i.imgur.com", v-model="editingEvent.imageUrl")
        b-field(label='URL (\"Read more\")')
          b-input(placeholder="(optional) https://google.com", v-model="editingEvent.url")
      .modal-card-foot.buttons.is-right
        button.button(@click="discard", :disabled="saving")
          span Close
        button.button.is-danger(v-if="editing", @click="askDelete", :disabled="saving")
          b-icon(icon="delete")
          span &nbsp;Delete
        button.button.is-primary(type="submit", form="history-edit-modal", :class="{ 'is-loading': saving }")
          b-icon(icon="check")
          span &nbsp;Confirm
</template>

<script>
const toDateString = date => {
  const pad = n => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export default {
  props: ["history"],
  data() {
    return {
      show: false,
      editing: false,
      adding: false,
      saving: false,
      editingEvent: {
        date: new Date(),
      },
    };
  },
  methods: {
    start(evt) {
      this.show = true;
      if (evt) {
        this.editing = true;
        this.editingEvent = { ...evt };
      } else {
        this.adding = true;
        this.editingEvent = { date: new Date() };
      }

      this.$nextTick(() => {
        document.querySelector(".modal-card-head input")?.focus();
      });
    },
    discard() {
      this.show = false;
      this.editing = false;
      this.adding = false;
      this.editingEvent = {};
    },
    payload() {
      const { name, description, date, url, imageUrl } = this.editingEvent;
      return { event: { name, description, date: toDateString(date), url, imageUrl } };
    },
    // one retry when someone else committed to history.json in the meantime
    async request(method, path, body) {
      const base = `${this.$config.metaconcordUrl}/history/events`;
      const send = () => this.$axios.request({ method, url: `${base}${path}`, data: body });
      try {
        return await send();
      } catch (err) {
        if (err.response?.status === 409) return send();
        throw err;
      }
    },
    fail(err) {
      console.error(err);
      this.$buefy.toast.open({
        type: "is-danger",
        message: err.response?.data?.error || "Saving the event failed",
        duration: 5000,
      });
    },
    askDelete() {
      this.$buefy.dialog.confirm({
        message: "Are you sure you want to delete this event?",
        onConfirm: async () => {
          this.saving = true;
          try {
            await this.request("delete", `/${this.editingEvent.id}`);
            this.discard();
            this.$emit("refresh");
          } catch (err) {
            this.fail(err);
          }
          this.saving = false;
        },
      });
    },
    async confirm() {
      if (!this.editingEvent.date) return;
      this.saving = true;
      try {
        let res;
        if (this.adding) {
          res = await this.request("post", "", this.payload());
        } else {
          res = await this.request("put", `/${this.editingEvent.id}`, this.payload());
        }
        const year = Number(res.data.event.date.slice(0, 4));
        this.discard();
        this.$emit("refresh", year);
      } catch (err) {
        this.fail(err);
      }
      this.saving = false;
    },
  },
};
</script>

<style lang="scss">
.history-edit-modal {
  .modal-card .modal-card-head .event-title {
    width: 100%;
  }
}
</style>
