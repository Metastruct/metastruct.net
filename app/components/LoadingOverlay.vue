<template>
  <div v-if="active" class="loading-overlay is-active" :class="{ 'is-full-page': fullPage }">
    <div class="loading-background"/>
    <div class="loading-icon"/>
  </div>
</template>

<script>
export default {
  props: {
    active: { type: Boolean, default: false },
    fullPage: { type: Boolean, default: true },
  },
};
</script>
