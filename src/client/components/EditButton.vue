<template lang="pug">
.edit-button
    a(v-if="!editing", @click="$emit('start')")
        b-icon(icon="pencil")
        span &nbsp;Edit
    template(v-else)
        a(@click="$emit('save')", role="button")
            b-icon(icon="content-save")
            span &nbsp;Save
        a(@click="$emit('cancel')")
            b-icon(icon="cancel")
            span &nbsp;Cancel
        a.has-text-danger(v-if="showDelete", @click="$emit('delete')")
            b-icon(icon="delete")
            span &nbsp;Delete
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

