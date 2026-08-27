<template>
  <div class="modal" :class="{ 'is-active': active }">
    <div class="modal-background" @click="close"/>
    <slot />
    <button class="modal-close is-large" aria-label="close" @click="close"/>
  </div>
</template>

<script>
export default {
  props: {
    active: { type: Boolean, default: false },
  },
  emits: ["update:active", "close"],
  watch: {
    // Bulma dims the page behind an open modal by clipping the html scrollbar
    active(open) {
      if (typeof document === "undefined") return;
      document.documentElement.classList.toggle("is-clipped", open);
    },
  },
  beforeUnmount() {
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("is-clipped");
    }
  },
  methods: {
    close() {
      this.$emit("update:active", false);
      this.$emit("close");
    },
  },
};
</script>
