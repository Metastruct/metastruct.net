<template>
  <component :is="is" class="card-tile is-child card tile" :to="to" :href="href">
    <div class="card-content">
      <div v-if="data.icon" class="icon-background">
        <MdiIcon :icon="data.icon" />
      </div>
      <p class="title has-text-primary-light">{{ data.title }}</p>
      <p class="subtitle">{{ data.subtitle }}</p>
    </div>
  </component>
</template>

<script>
// bound as a component rather than by name: auto-imports are resolved at compile
// time, so a dynamic <component :is="'nuxt-link'"> would not find it
import { NuxtLink } from "#components";

export default {
  props: ["data"],
  computed: {
    internal() {
      return this.data.path.startsWith("/");
    },
    is() {
      return this.internal ? NuxtLink : "a";
    },
    to() {
      return this.internal ? this.data.path : undefined;
    },
    href() {
      return this.internal ? undefined : this.data.path;
    },
  },
};
</script>

<style lang="scss">
a.card.tile.card-tile {
  .icon-background {
    .icon {
      transition: transform 0.1s linear;
    }
  }

  &:hover,
  &:active,
  &:focus {
    .icon-background {
      .icon {
        transform: scale(1.125, 1.125);
      }
    }
  }

  .card-content {
    padding-right: 25%;

    .icon-background {
      position: absolute;
      display: flex;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1.5rem;
      justify-content: flex-end;
      align-items: flex-end;

      .icon {
        transform-origin: center;
        height: 5rem;
        width: 5rem;
        color: rgba(255, 255, 255, 0.25);

        .mdi::before {
          font-size: 86px !important;
        }
      }
    }
  }
}
</style>
