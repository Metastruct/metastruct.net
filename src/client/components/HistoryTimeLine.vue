<template lang="pug">
.columns.is-centered
  .column
    .timeline
      template(v-for="(events, year) in historyYears")
        nuxt-link.timeline-year.has-text-light.has-text-centered(:to="`#${year}`", :id="year") {{ year }}
        HistoryTimeLineEvent(
          v-for="(event, index) in events",
          v-bind="event",
          :id="undefined",
          :is-left="index % 2 == 0",
          :timeline="events",
          :key="`${year}-${index}`",
          @edit="$emit('edit', event)"
        )
      //- .is-clearfix
  .column.is-2
    .year-picker
      client-only
        template(v-if="$store.state.user.isAdmin")
          a.has-text-primary.year(@click="$emit('add')")
            b-icon(icon="plus")
            span &nbsp;Add new event
          hr.divider
      nuxt-link.year(
        v-for="(_, year) in historyYears",
        :to="`#${year}`",
        :key="year",
        :class="{ 'is-active': $route.hash == `#${year}` }"
      ) {{ year }}
      nuxt-link.year.has-text-primary(to="#") Back to top
</template>

<script>
import HistoryTimeLineEvent from "@/components/HistoryTimeLineEvent.vue";
import sortBy from "lodash.sortby";

export default {
  components: {
    HistoryTimeLineEvent,
  },
  props: ["history"],
  computed: {
    historyYears() {
      const historyYears = {},
        history = this.history;

      for (const event of history) {
        const year = event.date.getFullYear();
        if (!historyYears[year]) historyYears[year] = [];
        historyYears[year].push(event);
      }

      for (const [year, events] of Object.entries(historyYears)) {
        historyYears[year] = sortBy(events, ["date"]);
      }

      return historyYears;
    },
  },
};
</script>

<style lang="scss">
.timeline {
  .timeline-year {
    display: block;
    clear: both;
    padding: 0.25em;
    border-radius: 4px;
    font-size: 2em;
    font-weight: 550;
    background: darken($secondary, 10%);
    margin-bottom: 1.5em;
  }
}

.year-picker {
  position: sticky;
  top: 1.5em;

  .year {
    display: flex;
    align-content: center;
    padding: 0.5em 0.75em;
    width: 100%;
    color: $light;
    border-radius: 4px;

    &:hover {
      background: darken($dark, 5%);
    }

    &:active,
    &.is-active {
      background: darken($secondary, 10%);
    }
  }
}
</style>
