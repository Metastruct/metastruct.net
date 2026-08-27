<template>
  <span class="icon" :class="[size, variant]">
    <i class="mdi" :class="[`mdi-${icon}`, glyphSize]"/>
  </span>
</template>

<script>
// Material Design Icons come from the CDN stylesheet in app.head. Bulma sizes the
// box with .icon.is-*, the font itself needs the matching mdi-*px class, which is
// what Buefy did for us before.
const GLYPH = {
  "is-small": "",
  "is-medium": "mdi-36px",
  "is-large": "mdi-48px",
};

export default {
  props: {
    icon: { type: String, required: true },
    size: { type: String, default: "" },
    // "is-danger" and friends, applied as Bulma's has-text-* helper
    type: { type: String, default: "" },
  },
  computed: {
    glyphSize() {
      return this.size in GLYPH ? GLYPH[this.size] : "mdi-24px";
    },
    variant() {
      return this.type ? this.type.replace(/^is-/, "has-text-") : "";
    },
  },
};
</script>
