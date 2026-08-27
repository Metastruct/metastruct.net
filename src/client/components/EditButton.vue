<template>
  <div class="edit-button">
    <a v-if="!editing" @click="$emit('start')">
      <b-icon icon="pencil" />
      <span>&nbsp;Edit</span>
    </a>
    <template v-else>
      <a role="button" @click="$emit('save')">
        <b-icon icon="content-save" />
        <span>&nbsp;Save</span>
      </a>
      <a @click="$emit('cancel')">
        <b-icon icon="cancel" />
        <span>&nbsp;Cancel</span>
      </a>
      <a v-if="showDelete" class="has-text-danger" @click="$emit('delete')">
        <b-icon icon="delete" />
        <span>&nbsp;Delete</span>
      </a>
    </template>
  </div>
</template>

<script>
export default {
  props: ["editing", "showDelete"],
};
</script>

<style lang="scss">
.edit-button {
  display: inline-flex;
  align-content: center;

  a {
    margin-left: 0;

    &:not(:first-child) {
      margin-left: 0.75em;
    }

    display: flex;
    align-content: center;
  }
}
</style>
