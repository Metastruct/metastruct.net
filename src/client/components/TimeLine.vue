<template lang="pug">
.columns.is-centered
    .column
        .timeline
            template(v-for="(timeline, year) in historyYears")
                nuxt-link.timeline-year.has-text-light.has-text-centered(:to="`#${year}`", :id="year") {{ year }}
                TimeLineEvent(v-for="(event, index) in timeline", :event="event", :index="index", :timeline="timeline", :key="`${year}-${index}`")
            .is-clearfix
    .column.is-2
        .year-picker
            nuxt-link.year(v-for="(_, year) in historyYears", :to="`#${year}`", :key="year", :class="{ 'is-active': $route.hash == `#${year}` }") {{ year }}
            nuxt-link.year.has-text-primary(to="#") Back to top
</template>

<style lang="scss">

@import "@/assets/overrides.scss";

.timeline {
    position: relative;

    &::before {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        width: 3px;
        left: 50%;
        margin-left: -1.5px;
        z-index: -1;
        background: lighten($dark, 20%);
    }
}

.timeline-year {
    display: block;
    clear: both;
    padding: 0.25em;
    border-radius: 4px;
    font-size: 2em;
    font-weight: 550;
    background: darken($secondary, 10%);
    margin-bottom: 1.5em;
}

.year-picker {
    position: sticky;
    top: 1.5em;

    .year {
        display: block;
        padding: 0.5em 0.75em;
        width: 100%;
        color: $light;
        border-radius: 4px;

        &:hover {
            background: darken($dark, 5%);
        }

        &:active, &.is-active {
            background: darken($secondary, 10%);
        }
    }
}

</style>

<script>

import TimeLineEvent from "@/components/TimeLineEvent.vue"

export default {
    components: {
        TimeLineEvent
    },
    props: [ "history" ],
    computed: {
        historyYears() {
            let historyYears = {},
                history      = this.history

            this.history.forEach(val => {
                let year = val.date.getFullYear()
                if (!historyYears[year]) historyYears[year] = []
                historyYears[year].push(val)
            })

            for (const year in historyYears) {
                if (historyYears.hasOwnProperty(year)) {
                    const val = historyYears[year]
                    val.sort((a, b) => {
                        return a.date > b.date ? 1 : -1
                    })
                }
            }

            return historyYears
        },
    },
}
</script>
