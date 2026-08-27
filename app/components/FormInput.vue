<template>
  <div
    class="control"
    :class="[
      $attrs.class,
      {
        'has-icons-left': !!icon,
        'has-icons-right': !!iconRight,
        'is-loading': loading,
      },
    ]"
  >
    <textarea
      v-if="type === 'textarea'"
      class="textarea"
      :class="size"
      :value="modelValue"
      v-bind="fieldAttrs"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <input
      v-else
      class="input"
      :class="size"
      :type="type"
      :value="modelValue"
      v-bind="fieldAttrs"
      @input="$emit('update:modelValue', $event.target.value)"
    >
    <MdiIcon v-if="icon" :icon="icon" class="is-left" />
    <MdiIcon
      v-if="iconRight"
      :icon="iconRight"
      class="is-right"
      :class="{ 'is-clickable': iconRightClickable }"
      @click="iconRightClickable && $emit('icon-right-click')"
    />
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Number], default: "" },
    type: { type: String, default: "text" },
    size: { type: String, default: "" },
    icon: { type: String, default: "" },
    iconRight: { type: String, default: "" },
    iconRightClickable: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
  },
  emits: ["update:modelValue", "icon-right-click"],
  computed: {
    // class goes on .control, the way Buefy placed it, so layout rules written
    // against the wrapper keep working; everything else reaches the field itself
    fieldAttrs() {
      const { class: _class, ...rest } = this.$attrs;
      return rest;
    },
  },
};
</script>

<style lang="scss">
.control .icon.is-clickable {
  pointer-events: auto;
  cursor: pointer;
}
</style>
