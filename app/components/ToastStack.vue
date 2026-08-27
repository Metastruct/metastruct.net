<template>
  <div class="notices is-top">
    <transition-group name="toast">
      <div v-for="toast in toasts" :key="toast.id" class="toast" :class="toast.type">
        {{ toast.message }}
      </div>
    </transition-group>
  </div>
</template>

<script>
export default {
  setup() {
    return { toasts: useToast().toasts };
  },
};
</script>

<style lang="scss">
.notices {
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  top: 0;
  left: 0;
  right: 0;
  padding: 2em;
  pointer-events: none;
  z-index: 1000;

  .toast {
    display: inline-flex;
    margin: 0.25em 0;
    padding: 0.75em 1.5em;
    border-radius: 4px;
    background: $grey-light;
    color: $text;
    box-shadow: $card-shadow;
    text-align: center;

    @each $name, $pair in $colors {
      &.is-#{$name} {
        background: nth($pair, 1);
        color: nth($pair, 2);
      }
    }
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease-out, transform 0.25s ease-out;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}
</style>
