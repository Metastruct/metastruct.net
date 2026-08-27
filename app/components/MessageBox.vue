<template>
  <article class="message" :class="[type, size]">
    <section class="message-body">
      <div v-if="hasIcon && icon" class="media">
        <div class="media-left">
          <MdiIcon :icon="icon" :type="type" size="is-large" />
        </div>
        <div class="media-content">
          <slot />
        </div>
      </div>
      <slot v-else />
    </section>
  </article>
</template>

<script>
// Buefy's b-message, rebuilt on Bulma's own message markup. The call sites
// only ever used type/size/has-icon.
const ICONS = {
  "is-info": "information",
  "is-success": "check-circle",
  "is-warning": "alert",
  "is-danger": "alert-circle",
};

export default {
  props: {
    type: { type: String, default: "" },
    size: { type: String, default: "" },
    hasIcon: { type: Boolean, default: false },
  },
  computed: {
    icon() {
      return ICONS[this.type] || null;
    },
  },
};
</script>
