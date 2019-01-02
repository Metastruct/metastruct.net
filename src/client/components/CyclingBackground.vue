<template lang="pug">

.cycling-background
    .background
        img(v-for="(url, i) in images", :src="url", :class="{ 'is-active': active == i }")
    slot

</template>

<style lang="scss">

.cycling-background {
    position: relative;
    display: block;
    height: 17.5rem;
    overflow: hidden;

    .background {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        height: 100%;
        filter: blur(4px) brightness(66%);

        img {
            position: absolute;
            display: block;
            top: 50%;
            transform: translateY(-50%);
            width: 100%;

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

