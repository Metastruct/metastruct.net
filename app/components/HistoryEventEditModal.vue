<template>
  <div class="history-edit-modal">
    <BaseModal v-model:active="show" @close="discard">
      <div class="modal-card">
        <header class="modal-card-head">
          <FormInput
            v-model="editingEvent.name"
            class="event-title"
            placeholder="Title"
            size="is-medium"
            form="history-edit-modal"
          />
        </header>
        <form id="history-edit-modal" class="modal-card-body" @submit.prevent="confirm">
          <FormField label="Description">
            <FormInput
              v-model="editingEvent.description"
              placeholder="Some descriptive text"
              type="textarea"
              minlength="0"
              maxlength="2000"
            />
          </FormField>
          <FormField label="Date">
            <FormInput v-model="dateValue" type="date" icon="calendar-today" required />
          </FormField>
          <FormField label="Image URL">
            <FormInput v-model="editingEvent.imageUrl" placeholder="(optional) https://i.imgur.com" />
          </FormField>
          <FormField label='URL ("Read more")'>
            <FormInput v-model="editingEvent.url" placeholder="(optional) https://google.com" />
          </FormField>
        </form>
        <div class="modal-card-foot buttons is-right">
          <button class="button" :disabled="saving" @click="discard">
            <span>Close</span>
          </button>
          <button v-if="editing" class="button is-danger" :disabled="saving" @click="askDelete">
            <MdiIcon icon="delete" />
            <span>&nbsp;Delete</span>
          </button>
          <button
            class="button is-primary"
            type="submit"
            form="history-edit-modal"
            :class="{ 'is-loading': saving }"
          >
            <MdiIcon icon="check" />
            <span>&nbsp;Confirm</span>
          </button>
        </div>
      </div>
    </BaseModal>
    <ConfirmDialog ref="dialog" />
  </div>
</template>

<script>
const toDateString = date => {
  const pad = n => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export default {
  props: ["history"],
  setup() {
    return { toast: useToast() };
  },
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
  computed: {
    // <input type="date"> speaks YYYY-MM-DD, the event carries a Date
    dateValue: {
      get() {
        const date = this.editingEvent.date;
        return date instanceof Date ? toDateString(date) : "";
      },
      set(value) {
        this.editingEvent.date = value ? new Date(`${value}T00:00:00`) : null;
      },
    },
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
      const send = () => this.$mc(`/history/events${path}`, { method, body });
      try {
        return await send();
      } catch (err) {
        if (err.response?.status === 409) return send();
        throw err;
      }
    },
    fail(err) {
      console.error(err);
      this.toast.open({
        type: "is-danger",
        message: err.data?.error || "Saving the event failed",
        duration: 5000,
      });
    },
    async askDelete() {
      const ok = await this.$refs.dialog.open({
        message: "Are you sure you want to delete this event?",
        confirmText: "Delete",
        confirmClass: "is-danger",
      });
      if (!ok) return;

      this.saving = true;
      try {
        const data = await this.request("DELETE", `/${this.editingEvent.id}`);
        this.discard();
        this.$emit("saved", data.events);
      } catch (err) {
        this.fail(err);
      }
      this.saving = false;
    },
    async confirm() {
      if (!this.editingEvent.date) return;
      this.saving = true;
      try {
        let data;
        if (this.adding) {
          data = await this.request("POST", "", this.payload());
        } else {
          data = await this.request("PUT", `/${this.editingEvent.id}`, this.payload());
        }
        const year = Number(data.event.date.slice(0, 4));
        this.discard();
        this.$emit("saved", data.events, year);
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
