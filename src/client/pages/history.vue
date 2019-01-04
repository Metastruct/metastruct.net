<template lang="pug">
#history
    section.section
        .container
            TimeLine(:history="history")
</template>

<style lang="scss">

</style>

<script>

import TimeLine from "@/components/TimeLine.vue"

export default {
    components: {
        TimeLine
    },
    data() {
        return {
            history: [

                {
                    name: "Test 1",
                    date: new Date("2018/01/01"),
                },
                {
                    name: "Test 2",
                    date: new Date("2018/01/01"),
                },
                {
                    name: "Test 3",
                    date: new Date("2018/01/01"),
                },
                {
                    name: "Test 4",
                    date: new Date("2018/01/02"),
                },
                {
                    name: "Test 5",
                    date: new Date("2019/01/03"),
                },
                {
                    name: "Test 6",
                    date: new Date("2019/01/04"),
                },
                {
                    name: "Test 7",
                    date: new Date("2019/01/05"),
                },
                {
                    name: "Test 8",
                    date: new Date("2019/01/06"),
                }

            ]
        }
    },
    async asyncData(ctx) {
        return {}

        let history = (await axios.get("http://new.metastruct.net:3000/api/v1/history")).data

        return { history }
    },
}

</script>

