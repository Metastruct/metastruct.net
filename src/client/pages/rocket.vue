<template lang="pug">
#rocket
  section.section
    .container
      client-only
        b-message(v-if="!$store.state.userLoaded") Loading…
        b-message(v-else-if="!$store.state.user.isAdmin", type="is-warning", has-icon)
          | The server console is for the Metastruct administrators and developers.&nbsp;
          a(:href="`${$config.metaconcordUrl}/auth/github?redirect=${encodeURIComponent($route.fullPath)}`") Log in with GitHub
        .rocket(v-else)
          aside.sidebar
            .sidebar-head Servers
            b-message(v-if="error", type="is-warning", size="is-small") {{ error }}
            ul.server-list
              li(
                v-for="server in servers",
                :key="server.key",
                :class="{ 'is-active': current && current.key === server.key }",
                @click="select(server)"
              )
                span.dot(:class="{ 'is-online': server.connected }")
                span.name {{ server.name }}
                img.game(:src="`/img/games/${server.game}.png`", :alt="server.game")
              li.empty(v-if="!servers.length") No hosted servers.
          .main(v-if="current")
            .status-bar
              span.server {{ current.name }}
              template(v-if="status && status.connected")
                span.stat
                  b-icon(icon="account-multiple", size="is-small")
                  span &nbsp;{{ status.players }}{{ status.max ? '/' + status.max : '' }}
                span.stat
                  b-icon(icon="speedometer", size="is-small")
                  span &nbsp;{{ tickLabel }}
                span.stat.map(v-if="status.map")
                  b-icon(icon="map", size="is-small")
                  span &nbsp;{{ status.map }}
              span.stat.offline(v-else) offline
              .levels(v-if="current.game === 'minecraft'")
                button.lvl(
                  v-for="lvl in levelNames",
                  :key="lvl",
                  type="button",
                  :class="{ 'is-off': !levels[lvl] }",
                  :data-level="lvl",
                  @click="toggleLevel(lvl)"
                ) {{ lvl }}
            .graphs(v-if="charts")
              stat-chart(
                title="CPU",
                :series="charts.cpu",
                :max="charts.cpuMax",
                :format="formatPercent"
              )
              stat-chart(
                title="Memory",
                :series="charts.memory",
                :max="charts.memoryMax",
                :format="formatBytes"
              )
              stat-chart(title="Network", :series="charts.network", :format="formatRate")
            .terminal-wrap
              .terminal(ref="terminal", @click="focusInput")
              .term-loader(v-if="state === 'connecting'")
                .spinner
                span attaching to {{ current.name }}…
            .actions(v-if="current.gserv")
              button.button.is-small(
                v-for="action in gservActions",
                :key="action",
                :disabled="state !== 'open' || gservBusy",
                @click="runGserv(action)"
              ) {{ action }}
            form.input-bar(:data-state="state", autocomplete="off", @submit.prevent="submit")
              span.segment RCON
              input(
                ref="input",
                v-model="input",
                type="text",
                spellcheck="false",
                placeholder="console command",
                @keydown="onKey"
              )
          .main.placeholder(v-else) Select a server.
</template>

<style lang="scss">
#rocket {
  .section {
    padding-top: 1.5rem;
  }

  .rocket {
    display: flex;
    gap: 0.75rem;
    height: 78vh;
    min-height: 460px;
  }

  .sidebar {
    flex: none;
    width: 210px;
    background: $grey-dark;
    border-radius: 4px;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    overflow-y: auto;

    .sidebar-head {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: $grey-lighter;
      padding: 0.25rem 0.5rem;
    }

    .server-list {
      display: flex;
      flex-direction: column;
      gap: 2px;

      li {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.6rem;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.1s ease-out;

        &:hover {
          background: $grey-light;
        }

        &.is-active {
          background: $secondary-dark;

          .game {
            opacity: 1;
          }
        }

        &.empty {
          color: $grey-lighter;
          cursor: default;
        }

        .name {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .game {
          flex: none;
          width: 1.2em;
          height: 1.2em;
          border-radius: 3px;
          opacity: 0.7;
        }
      }
    }

    .dot {
      flex: none;
      width: 0.5em;
      height: 0.5em;
      border-radius: 50%;
      background: $grey-lighter;

      &.is-online {
        background: $primary-light;
      }
    }
  }

  .main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    background: $grey-darker;
    border: 1px solid $grey-dark;
    border-radius: 4px;
    overflow: hidden;

    &.placeholder {
      align-items: center;
      justify-content: center;
      color: $grey-lighter;
    }
  }

  .status-bar {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 0.5rem 0.9rem;
    background: $grey-dark;
    font-size: 0.85rem;

    .server {
      font-weight: 700;
    }

    .stat {
      display: inline-flex;
      align-items: center;
      color: $white-ter;

      &.map {
        color: $grey-lighter;
      }

      &.offline {
        color: $danger;
      }
    }

    .levels {
      margin-left: auto;
      display: flex;
      flex-wrap: nowrap;
      gap: 0.3rem;

      .lvl {
        flex: none;
        white-space: nowrap;
        font-family: ui-monospace, "SF Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace;
        font-size: 0.65rem;
        letter-spacing: 0.05em;
        background: none;
        border: 1px solid $grey-light;
        border-radius: 3px;
        padding: 0.1rem 0.4rem;
        cursor: pointer;

        &[data-level="DEBUG"] {
          color: $grey-lighter;
        }

        &[data-level="INFO"] {
          color: $white-ter;
        }

        &[data-level="WARN"] {
          color: #e9d682;
        }

        &[data-level="ERROR"] {
          color: $danger;
        }

        &.is-off {
          opacity: 0.35;
          text-decoration: line-through;
        }
      }
    }
  }

  .graphs {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1px;
    background: $grey-dark;
    border-bottom: 1px solid $grey-dark;

    @media (max-width: 900px) {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .terminal-wrap {
    position: relative;
    flex: 1;
    min-height: 0;
    display: flex;
    overflow: hidden;
  }

  .terminal {
    flex: 1;
    min-height: 0;
    padding: 0.5rem 0 0 0.75rem;
  }

  .term-loader {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    background: rgba($grey-darker, 0.85);
    color: $white-ter;
    font-size: 0.9rem;

    .spinner {
      width: 1.4rem;
      height: 1.4rem;
      border: 2px solid $grey-light;
      border-top-color: $primary-light;
      border-radius: 50%;
      animation: rocket-spin 0.8s linear infinite;
    }
  }

  @keyframes rocket-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    padding: 0.5rem 0.75rem;
    background: $grey-darker;
    border-top: 1px solid $grey-dark;

    .button {
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace;
    }
  }

  // same prompt row as the metaconcord dashboard: a powerline segment, then the line
  .input-bar {
    display: flex;
    align-items: center;
    padding: 0.5rem 0;
    border-top: 1px solid $grey-light;
    font-family: ui-monospace, "SF Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace;
    font-size: 0.95rem;

    .segment {
      position: relative;
      flex: none;
      display: inline-flex;
      align-items: center;
      height: 1.6rem;
      margin-right: 0.8rem;
      padding: 0 0.6rem 0 1rem;
      background: $secondary-dark;
      color: $white;
      font-family: $family-sans-serif;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;

      &::after {
        content: "";
        position: absolute;
        left: 100%;
        top: 0;
        border-top: 0.8rem solid transparent;
        border-bottom: 0.8rem solid transparent;
        border-left: 0.6rem solid $secondary-dark;
      }
    }

    &[data-state="open"] .segment {
      background: $primary;

      &::after {
        border-left-color: $primary;
      }
    }

    &[data-state="closed"] .segment {
      background: #f14668;

      &::after {
        border-left-color: #f14668;
      }
    }

    input {
      flex: 1;
      height: 1.6rem;
      line-height: 1.6rem;
      margin: 0;
      padding: 0;
      background: none;
      border: none;
      color: $white;
      font: inherit;
      caret-color: $primary-light;

      &::placeholder {
        color: rgba($white, 0.25);
      }

      &:focus {
        outline: none;
      }
    }
  }
}
</style>

<script>
import "@xterm/xterm/css/xterm.css";
import StatChart from "~/components/StatChart.vue";

const HISTORY_KEY = "rocket.history";
const LEVELS_KEY = "rocket.levels";
// TRACE folds into DEBUG, FATAL into ERROR
const LEVEL_NAMES = ["DEBUG", "INFO", "WARN", "ERROR"];
const LEVEL_COLORS = {
  DEBUG: "\x1B[90m",
  WARN: "\x1B[33m",
  ERROR: "\x1B[31m",
};
const LOG_BUFFER_MAX = 3000;
const HISTORY_POINTS = 120;

const CPU_COLOR = "#0ce3ac";
const TX_COLOR = "#b06cb3";

export default {
  components: { StatChart },
  data() {
    return {
      servers: [],
      current: null,
      status: null,
      error: null,
      state: "closed",
      input: "",
      gservBusy: false,
      gservActions: ["rehash", "merge_repos", "rehashskeleton", "update_repos"],
      history: [],
      historyIndex: 0,
      draft: "",
      levelNames: LEVEL_NAMES,
      levels: { DEBUG: false, INFO: true, WARN: true, ERROR: true },
    };
  },
  head: { title: "Rocket" },
  computed: {
    tickLabel() {
      const tick = this.status && this.status.tick;
      if (!tick || tick.value == null) return "-";
      const value = tick.label === "tps" ? tick.value.toFixed(1) : tick.value;
      const mspt = this.status.mspt != null ? ` (${this.status.mspt.toFixed(1)} ms)` : "";
      return `${value} ${tick.label}${mspt}`;
    },
    charts() {
      const stats = this.status && this.status.stats;
      if (!stats || !stats.history || !stats.history.length) return null;
      const history = stats.history.slice(-HISTORY_POINTS);
      const pick = key => history.map(s => s[key] || 0);
      const current = stats.current || history[history.length - 1];
      return {
        cpu: [{ label: "", values: pick("cpu"), color: CPU_COLOR }],
        cpuMax: 100,
        memory: [{ label: "", values: pick("memUsed"), color: CPU_COLOR }],
        memoryMax: current.memMax || null,
        network: [
          { label: "rx", values: pick("netRx"), color: CPU_COLOR },
          { label: "tx", values: pick("netTx"), color: TX_COLOR },
        ],
      };
    },
  },
  watch: {
    "$store.state.user.isAdmin"(isAdmin) {
      if (isAdmin) this.loadServers();
    },
  },
  mounted() {
    try {
      this.history = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || "[]");
    } catch {
      this.history = [];
    }
    this.historyIndex = this.history.length;
    try {
      this.levels = { ...this.levels, ...JSON.parse(localStorage.getItem(LEVELS_KEY) || "{}") };
    } catch {
      // defaults stay
    }
    this.logLines = [];
    if (this.$store.state.user.isAdmin) this.loadServers();
    window.addEventListener("resize", this.fit);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.fit);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    clearInterval(this.statusTimer);
    this.disconnect();
    this.term?.dispose();
  },
  methods: {
    async loadServers() {
      try {
        const { data } = await this.$axios.get(`${this.$config.metaconcordUrl}/console/servers`, {
          progress: false,
        });
        this.servers = data;
        if (this.current || !data.length) return;
        // ?server=<key> deep-links a server, e.g. /rocket?server=minecraft:11
        const wanted = data.find(s => s.key === this.$route.query.server);
        this.select(wanted || data[0]);
      } catch (err) {
        this.error = `Could not list the servers: ${err.message}`;
      }
    },

    select(server) {
      // re-selecting the current server reconnects it when its socket is gone
      if (this.current && this.current.key === server.key && this.state !== "closed") return;
      this.current = server;
      this.status = null;
      this.$nextTick(() => this.connect());
      this.pollStatus();
    },

    async ensureTerminal() {
      if (this.term) return;
      const [{ Terminal }, { FitAddon }] = await Promise.all([
        import("@xterm/xterm"),
        import("@xterm/addon-fit"),
      ]);
      this.term = new Terminal({
        disableStdin: true,
        convertEol: true,
        scrollback: 5000,
        fontSize: 13,
        fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, "DejaVu Sans Mono", monospace',
        theme: {
          background: "#0d0d0d",
          foreground: "#fefefe",
          cursor: "#0ce3ac",
          selectionBackground: "rgba(125, 59, 128, 0.5)",
        },
      });
      this.fitAddon = new FitAddon();
      this.term.loadAddon(this.fitAddon);
    },

    async connect() {
      if (!this.current) return;
      const serverId = this.current.key;
      if (this.wsServerId === serverId && this.ws && this.ws.readyState <= WebSocket.OPEN) return;
      this.disconnect();
      this.wsServerId = serverId;
      await this.ensureTerminal();
      if (this.wsServerId !== serverId) return;
      const el = this.$refs.terminal;
      if (!el) return;
      if (this.term.element && this.term.element.parentElement !== el) {
        el.textContent = "";
        this.term.open(el);
      } else if (!this.term.element) {
        this.term.open(el);
      }
      this.term.reset();
      this.logLines = [];
      this.fit();
      // the graphs row shows up after the first status poll and shrinks the
      // terminal area, so refit whenever the wrapper changes size
      if (!this.resizeObserver && typeof ResizeObserver !== "undefined") {
        this.resizeObserver = new ResizeObserver(() => this.fit());
        this.resizeObserver.observe(el.parentElement);
      }
      this.state = "connecting";

      const base = this.$config.metaconcordUrl;
      const http = base.startsWith("http") ? new URL(base) : new URL(base, location.href);
      const proto = http.protocol === "https:" ? "wss:" : "ws:";
      const url = `${proto}//${http.host}${http.pathname.replace(
        /\/$/,
        ""
      )}/console/ws?server=${encodeURIComponent(serverId)}`;
      const ws = new WebSocket(url);
      this.ws = ws;
      // stay in "connecting" until the bridge reports the console is attached (ready)
      ws.onmessage = ev => {
        let msg;
        try {
          msg = JSON.parse(ev.data);
        } catch {
          return;
        }
        if (msg.type === "ready") this.state = "open";
        else if (msg.type === "data") this.term.write(msg.data);
        else if (msg.type === "log") this.writeLog(msg.lines);
        else if (msg.type === "gserv-done") this.gservBusy = false;
        else if (msg.type === "meta" || msg.type === "exit")
          this.term.writeln(`\r\n\x1B[3;90m--- ${msg.text || msg.reason} ---\x1B[0m`);
      };
      ws.onclose = async ev => {
        if (this.ws !== ws) return;
        this.ws = null;
        this.wsServerId = null;
        this.state = "closed";
        this.gservBusy = false;
        let reason;
        if (ev.code === 4001) {
          // server closed the socket because the session expired
          this.$store.dispatch("fetchUser");
          reason = "session expired, log in again";
        } else if (ev.code === 1006) {
          // 1006 covers every abnormal close, so probe the API for the real cause
          reason = await this.diagnoseRefusal(serverId);
        } else {
          reason = "disconnected";
        }
        this.term.writeln(`\r\n\x1B[3;90m--- ${reason} ---\x1B[0m`);
      };
      this.$nextTick(() => this.focusInput());
    },

    levelGroup(level) {
      if (level === "TRACE") return "DEBUG";
      if (level === "FATAL") return "ERROR";
      return LEVEL_NAMES.includes(level) ? level : "INFO";
    },

    renderLine(line) {
      const color = LEVEL_COLORS[this.levelGroup(line.level)];
      return color ? `${color}${line.text}\x1B[0m` : line.text;
    },

    writeLog(lines) {
      this.logLines.push(...lines);
      if (this.logLines.length > LOG_BUFFER_MAX) {
        this.logLines.splice(0, this.logLines.length - LOG_BUFFER_MAX);
      }
      const visible = lines.filter(line => this.levels[this.levelGroup(line.level)]);
      if (visible.length) {
        this.term.write(visible.map(line => this.renderLine(line)).join("\r\n") + "\r\n");
      }
    },

    toggleLevel(lvl) {
      this.levels = { ...this.levels, [lvl]: !this.levels[lvl] };
      try {
        localStorage.setItem(LEVELS_KEY, JSON.stringify(this.levels));
      } catch {
        // storage unavailable, the choice lasts for this page only
      }
      // repaint the buffered log with the new filter
      this.term.reset();
      const visible = this.logLines.filter(line => this.levels[this.levelGroup(line.level)]);
      if (visible.length) {
        this.term.write(visible.map(line => this.renderLine(line)).join("\r\n") + "\r\n");
      }
    },

    async diagnoseRefusal(key) {
      try {
        await this.$axios.get(
          `${this.$config.metaconcordUrl}/console/status/${encodeURIComponent(key)}`,
          { progress: false }
        );
        return "console refused (session limit reached, or rejected by the server)";
      } catch (err) {
        const code = err.response && err.response.status;
        if (code === 401 || code === 403) {
          this.$store.dispatch("fetchUser");
          return "session expired, log in again";
        }
        if (code === 404) return "unknown server, the site and metaconcord are out of sync";
        return "metaconcord is unreachable (down or restarting)";
      }
    },

    disconnect() {
      if (this.ws) {
        const ws = this.ws;
        this.ws = null;
        this.wsServerId = null;
        ws.close();
      }
      this.state = "closed";
      this.gservBusy = false;
    },

    pollStatus() {
      clearInterval(this.statusTimer);
      const tick = async () => {
        if (!this.current) return;
        const key = this.current.key;
        try {
          const { data } = await this.$axios.get(
            `${this.$config.metaconcordUrl}/console/status/${encodeURIComponent(key)}`,
            {
              progress: false,
            }
          );
          if (this.current && this.current.key === key) this.status = data;
        } catch (err) {
          // session expired: refresh the user so the login gate replaces the page
          const code = err.response && err.response.status;
          if (code === 401 || code === 403) this.$store.dispatch("fetchUser");
          // otherwise keep the last known status
        }
      };
      tick();
      this.statusTimer = setInterval(tick, 5000);
    },

    runGserv(action) {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN || this.gservBusy) return;
      this.gservBusy = true;
      this.ws.send(JSON.stringify({ type: "gserv", command: action }));
    },

    fit() {
      if (!this.fitAddon || !this.term || !this.term.element) return;
      // proposeDimensions can yield 0/NaN while the layout is in flux, and
      // resizing xterm with those breaks all further output
      const dims = this.fitAddon.proposeDimensions();
      if (dims && dims.cols > 0 && dims.rows > 0) this.term.resize(dims.cols, dims.rows);
    },

    formatPercent(v) {
      return `${Number(v).toFixed(1)}%`;
    },

    formatBytes(v) {
      const units = ["B", "KiB", "MiB", "GiB", "TiB"];
      let n = Number(v) || 0;
      let i = 0;
      while (n >= 1024 && i < units.length - 1) {
        n /= 1024;
        i++;
      }
      return `${n.toFixed(i >= 2 ? 2 : 0)} ${units[i]}`;
    },

    formatRate(v) {
      return `${this.formatBytes(v)}/s`;
    },

    focusInput() {
      if (!getSelection().toString() && this.$refs.input) this.$refs.input.focus();
    },

    submit() {
      const line = this.input;
      if (!line.trim()) return;
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.term.writeln("\x1B[31mnot connected\x1B[0m");
        return;
      }
      this.ws.send(JSON.stringify({ type: "input", line }));
      this.term.writeln(`\x1B[1;36m> ${line}\x1B[0m`);
      if (this.history[this.history.length - 1] !== line) this.history.push(line);
      if (this.history.length > 200) this.history.shift();
      this.historyIndex = this.history.length;
      try {
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(this.history));
      } catch {
        // storage unavailable, history stays in memory
      }
      this.input = "";
    },

    onKey(ev) {
      if (ev.key === "ArrowUp" && this.historyIndex > 0) {
        if (this.historyIndex === this.history.length) this.draft = this.input;
        this.historyIndex--;
        this.input = this.history[this.historyIndex];
        ev.preventDefault();
      } else if (ev.key === "ArrowDown" && this.historyIndex < this.history.length) {
        this.historyIndex++;
        this.input =
          this.historyIndex === this.history.length ? this.draft : this.history[this.historyIndex];
        ev.preventDefault();
      }
    },
  },
};
</script>
