<template>
  <component :is="is" v-bind="attrs">
    <MdiIcon v-if="link.icon" :icon="link.icon" />
    <span>{{ link.label }}</span>
  </component>
</template>

<script>
// bound as a component rather than by name: auto-imports are resolved at compile
// time, so a dynamic <component :is="'nuxt-link'"> would not find it
import { NuxtLink } from "#components";

// One nav entry, rendered the same way in the desktop bar and in the drawer.
// The caller supplies the class, which falls through to the root element.
export default {
  props: {
    link: { type: Object, required: true },
  },
  computed: {
    is() {
      return this.link.to ? NuxtLink : "a";
    },
    attrs() {
      if (this.link.to) return { to: this.link.to };
      return { href: this.link.href, ...(this.link.external && { target: "_blank" }) };
    },
  },
};
</script>
