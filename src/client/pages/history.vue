<template lang="pug">
#history
  section.section
    .container
      h1.title History of Meta Construct
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
  async asyncData({ $axios }) {
    const history = (await $axios.get("/api/v1/history").catch(console.error)).data;

    for (const event of history) {
      event.date = new Date(event.date);
    }

    return { history };
  },
  head() {
    return {
      title: "History - Meta Construct",
    };
  },
  methods: {
    async refreshHistory(year) {
      const history = (await this.$axios.get("/api/v1/history").catch(console.error)).data;

      history.forEach(event => {
        event.date = new Date(event.date);
      });

      this.history = history;

      if (year) this.$router.push({ hash: `#${year}` });
    },
  },
};
</script>
