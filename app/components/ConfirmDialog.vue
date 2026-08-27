<template>
  <BaseModal v-model:active="show" @close="cancel">
    <div class="modal-card confirm-dialog">
      <header v-if="title" class="modal-card-head">
        <p class="modal-card-title">{{ title }}</p>
      </header>
      <form class="modal-card-body" @submit.prevent="confirm">
        <p>{{ message }}</p>
        <FormInput
          v-if="prompt"
          ref="field"
          v-model="value"
          class="mt-3"
          :placeholder="placeholder"
          required
        />
      </form>
      <div class="modal-card-foot buttons is-right">
        <button class="button" type="button" @click="cancel">Cancel</button>
        <button class="button" :class="confirmClass" type="button" @click="confirm">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script>
// Oruga ships no dialog, so the two moderation prompts that used $buefy.dialog
// share this one. open() resolves with the entered text (or true), or null when
// the operator backs out.
export default {
  data() {
    return {
      show: false,
      title: "",
      message: "",
      prompt: false,
      placeholder: "",
      confirmText: "Confirm",
      confirmClass: "is-primary",
      value: "",
      resolve: null,
    };
  },
  methods: {
    open(options = {}) {
      this.title = options.title || "";
      this.message = options.message || "";
      this.prompt = !!options.prompt;
      this.placeholder = options.placeholder || "";
      this.confirmText = options.confirmText || "Confirm";
      this.confirmClass = options.confirmClass || "is-primary";
      this.value = options.value || "";
      this.show = true;

      this.$nextTick(() => {
        this.$refs.field?.$el?.querySelector("input")?.focus();
      });

      return new Promise(resolve => {
        this.resolve = resolve;
      });
    },
    settle(result) {
      this.show = false;
      const resolve = this.resolve;
      this.resolve = null;
      if (resolve) resolve(result);
    },
    confirm() {
      if (this.prompt && !this.value.trim()) return;
      this.settle(this.prompt ? this.value : true);
    },
    cancel() {
      this.settle(null);
    },
  },
};
</script>
