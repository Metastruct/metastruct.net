<template lang="pug">

.cycling-background
    .background
        img(v-for="(url, i) in images", :src="url", :class="{ 'is-active': active == i }")

</template>

<style lang="scss">

.cycling-background {
    position: relative;
    display: block;
    height: 22.5rem;
    overflow: hidden;

    .background {
        height: 100%;
        filter: blur(4px);

        img {
            position: absolute;
            display: block;
            top: 50%;
            transform: translateY(-50%);
            width: 100%;
            z-index: 1;

            opacity: 0;
            transition: opacity 2s ease-in;

            &.is-active {
                opacity: 1;
            }
        }
    }
}

</style>

<script>

export default {
    props: [ "images" ],
    data() {
        return {
            active: 0,

            cycling: null
        }
    },
    mounted() {
        this.cycling = setInterval(() => {
            if (!this) return
            if (this.images) {
                if (++this.active > this.images.length - 1) this.active = 0
            }
        }, 10000)
    }
}

</script>

