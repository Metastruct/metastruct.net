<template>
  <div class="field">
    <label v-if="label" class="label">{{ label }}</label>
    <slot />
    <p v-if="message" class="help" :class="type">{{ message }}</p>
  </div>
</template>

<script>
export default {
  props: {
    label: { type: String, default: "" },
    message: { type: String, default: "" },
    // "is-danger" turns the help text red, as Buefy's b-field did
    type: { type: String, default: "" },
  },
};
</script>
