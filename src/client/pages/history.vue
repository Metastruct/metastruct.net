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
      HistoryTimeLine(ref="timeline", :history.sync="history", @refresh="refreshHistory")
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

    history.forEach(val => {
      val.date = new Date(val.date);
    });

    return { history };
  },
  data() {
    return {
      history: [],
    };
  },
  head() {
    return {
      title: "History - Meta Construct",
    };
  },
  mounted() {
    if (this.$refs.modal) {
      this.$refs.timeline.$on("wantAdd", () => this.$refs.modal.start());
      this.$refs.timeline.$on("wantEdit", evt => this.$refs.modal.start(evt));
    }
  },
  methods: {
    async refreshHistory(year) {
      const history = (await this.$axios.get("/api/v1/history").catch(console.error)).data;

      history.forEach(val => {
        val.date = new Date(val.date);
      });

      this.history = history;

      if (year) this.$router.push({ hash: `#${year}` });
    },
  },
};
</script>
