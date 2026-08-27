<template>
  <div :id="dateString" class="timeline-event" :class="{ 'is-left': isLeft, 'is-right': !isLeft }">
    <client-only>
      <EditButton v-if="user.isAdmin" @start="$emit('edit')" />
    </client-only>
    <div class="card">
      <div v-if="!!imageUrl" class="card-image image is-16by9">
        <figure class="image">
          <img v-if="!imageBroken" :src="imageUrl" @error="imageBroken = true" >
          <div v-else class="image-dead" :title="`Image failed to load: ${imageUrl}`">
            <MdiIcon icon="image-broken-variant" size="is-large" />
          </div>
        </figure>
      </div>
      <div class="card-content">
        <h1 class="title">
          <nuxt-link class="has-text-primary-light" :to="`#${dateString}`">{{ name }}</nuxt-link>
        </h1>
        <p v-if="description" style="white-space: pre-wrap">{{ description }}</p>
        <p class="mt-4 is-size-7 has-text-white-ter" :title="date.toLocaleDateString('en-US')">
          {{ date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) }}
        </p>
      </div>
      <div v-if="!!url" class="card-footer">
        <a class="card-footer-item has-text-primary" :href="url">Read more</a>
      </div>
    </div>
  </div>
</template>

<script>
import EditButton from "@/components/EditButton.vue";

export default {
  components: {
    EditButton,
  },
  props: ["imageUrl", "name", "description", "url", "date", "timeline", "isLeft"],
  setup() {
    return useUser();
  },
  data() {
    // several history images are hotlinked from sites that block them, so a
    // dead link gets a deliberate placeholder rather than an empty frame
    return { imageBroken: false };
  },
  computed: {
    dateString() {
      const pad = n => String(n).padStart(2, "0");
      return `${this.date.getFullYear()}-${pad(this.date.getMonth() + 1)}-${pad(
        this.date.getDate()
      )}`;
    },
  },
  watch: {
    imageUrl() {
      this.imageBroken = false;
    },
  },
};
</script>

<style lang="scss">
// Stands in for a hotlinked image whose host stopped serving it, so a dead
// link is obvious when the timeline is being edited.
.image-dead {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $black;
  color: $grey-lighter;
}

.timeline-event {
  position: relative;
  width: calc(50% - 1.5em);
  margin-bottom: 3em;

  .timeline-link {
    display: block;
    position: absolute;
    width: 1.5em;
    height: 1.5em;
    top: calc(3em - 1.5em * 0.5);
    color: $primary;
  }

  &.is-left {
    float: left;
    clear: left;
  }

  &.is-right {
    float: right;
    clear: right;
  }

  .card {
    .card-content {
      &.editing {
        padding: 0.75em;
      }
    }

    animation: fade 0.5s ease-out;

    &:empty {
      animation: loading 1s ease-in-out infinite;
    }

    .datepicker {
      margin-bottom: 0;
    }
  }

  @keyframes fade {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }

  @keyframes loading {
    0% {
      opacity: 1;
    }

    50% {
      opacity: 0.5;
    }

    100% {
      opacity: 1;
    }
  }

  .edit-button {
    position: absolute;
    top: -0.75em;
    left: 0.75em;
    transform: translateY(-100%);
    z-index: 1;
    transition: opacity 0.25s ease-out 1.5s;
    opacity: 0;
  }

  &:hover {
    .edit-button {
      opacity: 1;
      transition-delay: 0s;
    }
  }
}
</style>
