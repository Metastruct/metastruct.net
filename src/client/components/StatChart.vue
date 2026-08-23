<template lang="pug">
.stat-chart
  .head
    span.title {{ title }}
    span.values
      span.value(v-for="s in series", :key="s.label", :style="{ color: s.color }")
        | {{ s.label ? s.label + ' ' : '' }}{{ format(latest(s)) }}
  .plot
    .axis
      span {{ format(ceiling) }}
      span {{ format(ceiling / 2) }}
      span {{ format(0) }}
    svg(viewBox="0 0 300 80", preserveAspectRatio="none")
      line.grid(x1="0", x2="300", y1="2", y2="2")
      line.grid(x1="0", x2="300", y1="40", y2="40")
      template(v-for="(s, i) in series")
        path.area(:key="'a' + i", :d="areaPath(s)", :style="{ fill: s.color }")
        path.line(:key="'l' + i", :d="linePath(s)", :style="{ stroke: s.color }")
</template>

<style lang="scss">
.stat-chart {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: $grey-darker;
  padding: 0.4rem 0.6rem 0.3rem;
  font-size: 0.75rem;

  .head {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.25rem;

    .title {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: $grey-lighter;
    }

    .values {
      display: flex;
      gap: 0.6rem;
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace;
      white-space: nowrap;
    }
  }

  .plot {
    display: flex;
    gap: 0.4rem;
    min-width: 0;
  }

  .axis {
    flex: none;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-end;
    height: 64px;
    color: $grey-lighter;
    font-size: 0.6rem;
    line-height: 1;
    font-family: ui-monospace, "SF Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace;
  }

  svg {
    flex: 1;
    min-width: 0;
    height: 64px;
    display: block;
    background: $grey-accent;

    .grid {
      stroke: $grey-light;
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
    }

    .area {
      opacity: 0.18;
    }

    .line {
      fill: none;
      stroke-width: 1.5;
      vector-effect: non-scaling-stroke;
    }
  }
}
</style>

<script>
const W = 300;
const H = 80;
const PAD = 2;

// Area/line chart for the rocket page graphs: a few series of equal length,
// an optional ceiling (memory max, 100% cpu) and a formatter for the current value.
export default {
  props: {
    title: { type: String, required: true },
    // [{ label, values: number[], color }]
    series: { type: Array, required: true },
    max: { type: Number, default: null },
    // how many points the chart spans, so short histories grow from the right
    points: { type: Number, default: 120 },
    format: { type: Function, default: v => String(v) },
  },
  computed: {
    ceiling() {
      let peak = 0;
      for (const s of this.series) for (const v of s.values) if (v > peak) peak = v;
      // a fixed max snaps to its next multiple when exceeded (cpu above one core)
      if (this.max != null && this.max > 0)
        return Math.ceil(Math.max(peak, 1) / this.max) * this.max;
      return peak > 0 ? peak * 1.1 : 1;
    },
  },
  methods: {
    latest(s) {
      return s.values.length ? s.values[s.values.length - 1] : 0;
    },
    coords(s) {
      const values = s.values;
      const n = values.length;
      if (!n) return [];
      const span = Math.max(this.points - 1, 1);
      const step = (W - PAD * 2) / span;
      const x0 = W - PAD - (n - 1) * step;
      return values.map((v, i) => [
        x0 + i * step,
        H - PAD - (Math.min(Math.max(v, 0), this.ceiling) / this.ceiling) * (H - PAD * 2),
      ]);
    },
    linePath(s) {
      const pts = this.coords(s);
      if (!pts.length) return "";
      return pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    },
    areaPath(s) {
      const pts = this.coords(s);
      if (!pts.length) return "";
      const first = pts[0];
      const last = pts[pts.length - 1];
      return `${this.linePath(s)} L${last[0].toFixed(1)},${H - PAD} L${first[0].toFixed(1)},${
        H - PAD
      } Z`;
    },
  },
};
</script>
