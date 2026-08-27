<template>
  <div class="columns is-centered">
    <div class="column">
      <div class="timeline">
        <template v-for="(events, year) in historyYears" :key="year">
          <nuxt-link
            :id="year"
            class="timeline-year has-text-light has-text-centered"
            :to="`#${year}`"
            >{{ year }}</nuxt-link
          >
          <HistoryTimeLineEvent
            v-for="(event, index) in events"
            v-bind="event"
            :id="undefined"
            :key="event.id"
            :is-left="index % 2 == 0"
            :timeline="events"
            @edit="$emit('edit', event)"
          />
        </template>
      </div>
    </div>
    <div class="column is-2">
      <div class="year-picker">
        <client-only>
          <template v-if="user.isAdmin">
            <a class="has-text-primary year" @click="$emit('add')">
              <MdiIcon icon="plus" />
              <span>&nbsp;Add new event</span>
            </a>
            <hr class="divider" >
          </template>
        </client-only>
        <nuxt-link
          v-for="(_, year) in historyYears"
          :key="year"
          class="year"
          :to="`#${year}`"
          :class="{ 'is-active': $route.hash == `#${year}` }"
          >{{ year }}</nuxt-link
        >
        <nuxt-link class="year has-text-primary" to="#">Back to top</nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
import HistoryTimeLineEvent from "@/components/HistoryTimeLineEvent.vue";
import sortBy from "lodash.sortby";

export default {
  components: {
    HistoryTimeLineEvent,
  },
  props: ["history"],
  setup() {
    return useUser();
  },
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
