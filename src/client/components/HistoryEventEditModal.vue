<template>
  <div class="history-edit-modal">
    <b-modal :active.sync="show" has-modal-card @close="discard">
      <div class="modal-card">
        <header class="modal-card-head">
          <b-input
            v-model="editingEvent.name"
            class="event-title"
            placeholder="Title"
            size="is-medium"
            form="history-edit-modal"
          />
        </header>
        <form id="history-edit-modal" class="modal-card-body" @submit.prevent="confirm">
          <b-field label="Description">
            <b-input
              v-model="editingEvent.description"
              placeholder="Some descriptive text"
              type="textarea"
              minlength="0"
              maxlength="2000"
            />
          </b-field>
          <b-field label="Date">
            <b-datepicker
              v-model="editingEvent.date"
              placeholder="Click to select..."
              icon="calendar-today"
            />
          </b-field>
          <b-field label="Image URL">
            <b-input v-model="editingEvent.imageUrl" placeholder="(optional) https://i.imgur.com" />
          </b-field>
          <b-field label='URL ("Read more")'>
            <b-input v-model="editingEvent.url" placeholder="(optional) https://google.com" />
          </b-field>
        </form>
        <div class="modal-card-foot buttons is-right">
          <button class="button" :disabled="saving" @click="discard">
            <span>Close</span>
          </button>
          <button v-if="editing" class="button is-danger" :disabled="saving" @click="askDelete">
            <b-icon icon="delete" />
            <span>&nbsp;Delete</span>
          </button>
          <button
            class="button is-primary"
            type="submit"
            form="history-edit-modal"
            :class="{ 'is-loading': saving }"
          >
            <b-icon icon="check" />
            <span>&nbsp;Confirm</span>
          </button>
        </div>
      </div>
    </b-modal>
  </div>
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
            const res = await this.request("delete", `/${this.editingEvent.id}`);
            this.discard();
            this.$emit("saved", res.data.events);
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
        this.$emit("saved", res.data.events, year);
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
