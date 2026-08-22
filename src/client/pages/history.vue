<template lang="pug">
#history
  section.section
    .container
      h1.title History of Meta Construct
      b-message(v-if="error", type="is-warning", has-icon) {{ error }}
      client-only
        HistoryEventEditModal(
          ref="modal",
          v-if="$store.state.user.isAdmin",
          :history.sync="history",
          @saved="applyHistory"
        )
      HistoryTimeLine(
        ref="timeline",
        :history.sync="history",
        @refresh="refreshHistory",
        @add="$refs.modal.start()",
        @edit="$refs.modal.start($event)"
      )
</template>

<style lang="scss">
#history {
  .title {
    display: inline-block;
    margin-right: 0.25em;
  }

  .add-button {
    display: inline-flex;
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
import HistoryTimeLine from "@/components/HistoryTimeLine.vue";
import HistoryEventEditModal from "@/components/HistoryEventEditModal.vue";

export default {
  components: {
    HistoryTimeLine,
    HistoryEventEditModal,
  },
  data() {
    return { history: [], error: null };
  },
  fetchOnServer: false,
  async fetch() {
    await this.loadHistory();
  },
  head() {
    return {
      title: "History - Meta Construct",
    };
  },
  methods: {
    async loadHistory() {
      try {
        const { data } = await this.$axios.get(`${this.$config.metaconcordUrl}/history`, {
          progress: false,
        });
        this.history = data.events.map(event => ({
          ...event,
          date: new Date(`${event.date}T00:00:00`),
        }));
        this.error = null;
      } catch (err) {
        console.error(err);
        this.error = "The history is unavailable right now.";
      }
    },
    // the list comes back from metaconcord after a save
    applyHistory(events, year) {
      this.history = events.map(event => ({
        ...event,
        date: new Date(`${event.date}T00:00:00`),
      }));
      if (year) this.$router.push({ hash: `#${year}` });
    },
    async refreshHistory() {
      await this.loadHistory();
    },
  },
};
</script>
