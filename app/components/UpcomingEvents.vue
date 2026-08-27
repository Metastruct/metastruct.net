<template>
  <div v-if="events.length" class="upcoming-events">
    <div class="upcoming-header">
      <MdiIcon icon="calendar-clock" />
      <span>&nbsp;Upcoming events</span>
    </div>
    <!-- Same tile grid as the rows below, three is-4 columns, so the edges line up. -->
    <div class="tile is-ancestor">
      <div v-for="event in events" :key="event.id" class="tile is-parent is-4">
        <a class="tile is-child card event-card" :href="event.url" target="_blank" rel="noopener">
          <div
            v-if="event.image"
            class="event-image"
            :style="{ backgroundImage: `url(${event.image})` }"
          />
          <div class="card-content">
            <p class="title is-5 has-text-primary-light">{{ event.name }}</p>
            <p class="event-when">
              <MdiIcon icon="clock-outline" size="is-small" />
              <span>&nbsp;{{ when(event) }}</span>
              <span v-if="event.recurring" class="tag is-dark ml-2">recurring</span>
            </p>
            <p v-if="event.location" class="event-where">
              <MdiIcon icon="map-marker" size="is-small" />
              <span>&nbsp;{{ event.location }}</span>
            </p>
            <p v-if="event.description" class="event-description">{{ event.description }}</p>
          </div>
        </a>
      </div>
    </div>
    <hr class="divider" >
  </div>
</template>

<script>
export default {
  props: { events: { type: Array, default: () => [] } },
  methods: {
    when(event) {
      const start = new Date(event.start);
      const day = start.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      const time = start.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
      return `${day}, ${time}`;
    },
  },
};
</script>

<style lang="scss">
.upcoming-events {
  .upcoming-header {
    display: flex;
    align-items: center;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: $white-ter;
  }

  .divider {
    margin: 0.75rem 0 1.5rem;
  }

  .event-card {
    display: block;
    overflow: hidden;
    transition: transform 0.1s linear;

    &:hover {
      transform: translateY(-2px);
    }

    .event-image {
      height: 7rem;
      background-size: cover;
      background-position: center;
    }

    .card-content {
      padding: 1rem 1.25rem;
    }

    .title {
      margin-bottom: 0.5rem;
    }

    .event-when,
    .event-where {
      display: flex;
      align-items: center;
      font-size: 0.9rem;
      color: $white-ter;
    }

    .event-description {
      margin-top: 0.5rem;
      font-size: 0.85rem;
      color: $white-ter;
      opacity: 0.7;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      white-space: pre-line;
    }
  }
}
</style>
