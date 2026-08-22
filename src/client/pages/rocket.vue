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
                :key="server.id",
                :class="{ 'is-active': current && current.id === server.id }",
                @click="select(server)"
              )
                span.dot(:class="{ 'is-online': server.connected }")
                span.name {{ server.name }}
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
                  span &nbsp;{{ status.fps != null ? status.fps + ' fps' : '-' }}
                span.stat.map(v-if="status.map")
                  b-icon(icon="map", size="is-small")
                  span &nbsp;{{ status.map }}
              span.stat.offline(v-else) offline
            .terminal(ref="terminal", @click="focusInput")
            .actions
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
        }

        &.empty {
          color: $grey-lighter;
          cursor: default;
        }

        .name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
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
  }

  .terminal {
    flex: 1;
    min-height: 0;
    padding: 0.5rem 0 0 0.75rem;
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

const HISTORY_KEY = "rocket.history";

export default {
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
    };
  },
  head: { title: "Rocket" },
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
    if (this.$store.state.user.isAdmin) this.loadServers();
    window.addEventListener("resize", this.fit);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.fit);
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
        if (!this.current && data.length) this.select(data[0]);
      } catch (err) {
        this.error = `Could not list the servers: ${err.message}`;
      }
    },

    select(server) {
      if (this.current && this.current.id === server.id) return;
      this.current = server;
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
      const serverId = this.current.id;
      if (this.wsServerId === serverId) return;
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
      this.fit();
      this.state = "connecting";

      const base = this.$config.metaconcordUrl;
      const http = base.startsWith("http") ? new URL(base) : new URL(base, location.href);
      const proto = http.protocol === "https:" ? "wss:" : "ws:";
      const url = `${proto}//${http.host}${http.pathname.replace(
        /\/$/,
        ""
      )}/console/ws?server=${serverId}`;
      const ws = new WebSocket(url);
      this.ws = ws;
      ws.onopen = () => (this.state = "open");
      ws.onmessage = ev => {
        let msg;
        try {
          msg = JSON.parse(ev.data);
        } catch {
          return;
        }
        if (msg.type === "data") this.term.write(msg.data);
        else if (msg.type === "gserv-done") this.gservBusy = false;
        else if (msg.type === "meta" || msg.type === "exit")
          this.term.writeln(`\r\n\x1b[3;90m--- ${msg.text || msg.reason} ---\x1b[0m`);
      };
      ws.onclose = ev => {
        if (this.ws !== ws) return;
        this.state = "closed";
        this.gservBusy = false;
        const reason =
          ev.code === 1006 ? "connection refused (not logged in, or no access)" : "disconnected";
        this.term.writeln(`\r\n\x1b[3;90m--- ${reason} ---\x1b[0m`);
      };
      this.$nextTick(() => this.focusInput());
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
        const id = this.current.id;
        try {
          const {
            data,
          } = await this.$axios.get(`${this.$config.metaconcordUrl}/console/status/${id}`, {
            progress: false,
          });
          if (this.current && this.current.id === id) this.status = data;
        } catch {
          // keep the last known status
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
      if (this.fitAddon && this.term && this.term.element) this.fitAddon.fit();
    },

    focusInput() {
      if (!getSelection().toString() && this.$refs.input) this.$refs.input.focus();
    },

    submit() {
      const line = this.input;
      if (!line.trim()) return;
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.term.writeln("\x1b[31mnot connected\x1b[0m");
        return;
      }
      this.ws.send(JSON.stringify({ type: "input", line }));
      this.term.writeln(`\x1b[1;36m> ${line}\x1b[0m`);
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
