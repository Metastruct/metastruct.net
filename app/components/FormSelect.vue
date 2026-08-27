<template>
  <div
    class="control"
    :class="[$attrs.class, { 'is-expanded': expanded }]"
  >
    <span class="select" :class="{ 'is-fullwidth': expanded }">
      <select
        :value="modelValue"
        v-bind="fieldAttrs"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <slot />
      </select>
    </span>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Number], default: "" },
    expanded: { type: Boolean, default: false },
  },
  emits: ["update:modelValue"],
  computed: {
    // class goes on .control, the way Buefy placed it; the rest reaches the select
    fieldAttrs() {
      const { class: _class, ...rest } = this.$attrs;
      return rest;
    },
  },
};
</script>
