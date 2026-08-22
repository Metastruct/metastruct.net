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
          @refresh="refreshHistory($event)"
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
    async loadHistory(bustCache) {
      try {
        const url = bustCache
          ? `${this.$config.historyUrl}?t=${Date.now()}`
          : this.$config.historyUrl;
        const { data } = await this.$axios.get(url, { withCredentials: false, progress: false });
        this.history = data.map(event => ({
          ...event,
          date: new Date(`${event.date}T00:00:00`),
        }));
        this.error = null;
      } catch (err) {
        console.error(err);
        this.error = "The history is unavailable right now.";
      }
    },
    async refreshHistory(year) {
      await this.loadHistory(true);
      if (year) this.$router.push({ hash: `#${year}` });
    },
  },
};
</script>
