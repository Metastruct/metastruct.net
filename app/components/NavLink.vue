<template>
  <component :is="link.to ? 'nuxt-link' : 'a'" v-bind="attrs">
    <MdiIcon v-if="link.icon" :icon="link.icon" />
    <span>{{ link.label }}</span>
  </component>
</template>

<script>
// One nav entry, rendered the same way in the desktop bar and in the drawer.
// The caller supplies the class, which falls through to the root element.
export default {
  props: {
    link: { type: Object, required: true },
  },
  computed: {
    attrs() {
      if (this.link.to) return { to: this.link.to };
      return { href: this.link.href, ...(this.link.external && { target: "_blank" }) };
    },
  },
};
</script>
