<template lang="pug">
#history
    section.section
        .container
            h1.title.has-text-light History of Meta Construct
            AddHistoryModal(v-if="$store.state.user.isAdmin", :history.sync="history", @refresh="refreshHistory($event)")
            TimeLine(:history.sync="history", @refresh="refreshHistory")
</template>

<style lang="scss">

#history {
    .title {
        display: inline-block;
        margin-right: 0.25em;
    }
}

</style>

<script>

import TimeLine from "@/components/TimeLine.vue"
import AddHistoryModal from "@/components/AddHistoryModal.vue"
import axios from "axios"

export default {
    components: {
        TimeLine,
        AddHistoryModal
    },
    data() {
        return {
            history: []
        }
    },
    async asyncData(ctx) {
        let history = (await axios.get("/api/v1/history")).data

        history.forEach(val => {
            val.date = new Date(val.date)
        })

        return { history }
    },
    methods: {
        async refreshHistory(year) {
            let history = (await this.$axios.get("/api/v1/history")).data

            history.forEach(val => {
                val.date = new Date(val.date)
            })

            this.history = history

            if (year) this.$router.push({ hash: `#${year}` })
        }
    }
}

</script>

