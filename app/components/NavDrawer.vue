<template>
  <div class="nav-drawer" :class="{ 'is-active': open }">
    <div class="nav-drawer-backdrop" @click="close" />
    <aside class="nav-drawer-panel">
      <nav class="nav-drawer-body" aria-label="main navigation">
        <template v-for="(section, index) in sections" :key="section.label || index">
          <div v-if="section.label" class="nav-drawer-section">
            <button
              class="nav-drawer-link"
              :aria-expanded="isExpanded(section.label)"
              @click="toggle(section.label)"
            >
              <MdiIcon :icon="section.icon" />
              <span>{{ section.label }}</span>
              <MdiIcon
                class="nav-drawer-chevron"
                :class="{ 'is-flipped': isExpanded(section.label) }"
                icon="chevron-down"
              />
            </button>
            <div v-show="isExpanded(section.label)">
              <NavLink
                v-for="link in section.items"
                :key="link.label"
                class="nav-drawer-link is-nested"
                :link="link"
                @click="close"
              />
            </div>
          </div>
          <template v-else>
            <NavLink
              v-for="link in section.items"
              :key="link.label"
              class="nav-drawer-link"
              :link="link"
              @click="close"
            />
          </template>
        </template>
      </nav>

      <div class="nav-drawer-account">
        <div v-if="user.login" class="nav-drawer-user">
          <img class="avatar" :src="user.avatarUrl" :alt="user.login" >
          <span>{{ user.login }}</span>
        </div>
        <a v-if="!user.login" key="login" class="nav-drawer-link" :href="loginUrl">
          <MdiIcon icon="login" />
          <span>Log in (Admin)</span>
        </a>
        <a v-else key="logout" class="nav-drawer-link" @click="logout(), close()">
          <MdiIcon icon="logout" />
          <span>Log out</span>
        </a>
      </div>
    </aside>
  </div>
</template>

<script>
// Off-canvas navigation for anything below Bulma's navbar breakpoint. The panel
// stays mounted so it can slide, `visibility` keeps it out of the tab order while
// it is closed.
export default {
  props: {
    open: { type: Boolean, default: false },
  },
  emits: ["update:open"],
  setup() {
    return { ...useUser(), ...useNav() };
  },
  data() {
    return {
      // labels of the sections currently unfolded, all closed on open so the
      // list stays short
      expanded: [],
    };
  },
  computed: {
    sections() {
      return [...this.start, ...this.end];
    },
    loginUrl() {
      return `${this.$mcUrl}/auth/github?redirect=${encodeURIComponent(this.$route.fullPath)}`;
    },
  },
  watch: {
    open(open) {
      if (typeof document === "undefined") return;
      document.documentElement.classList.toggle("is-clipped", open);
    },
    // a tapped link would otherwise navigate behind a drawer that stays open
    "$route.fullPath"() {
      this.close();
    },
  },
  mounted() {
    document.addEventListener("keydown", this.onKeydown);
  },
  beforeUnmount() {
    document.removeEventListener("keydown", this.onKeydown);
    document.documentElement.classList.remove("is-clipped");
  },
  methods: {
    close() {
      if (this.open) this.$emit("update:open", false);
    },
    isExpanded(label) {
      return this.expanded.includes(label);
    },
    toggle(label) {
      this.expanded = this.isExpanded(label)
        ? this.expanded.filter(l => l !== label)
        : [...this.expanded, label];
    },
    onKeydown(event) {
      if (event.key === "Escape") this.close();
    },
  },
};
</script>

<style lang="scss">
// Bulma's $navbar-height, which is also the height of the brand logo
$nav-drawer-offset: 3.25rem;

.nav-drawer {
  position: fixed;
  // clears the navbar, which stays visible and whose burger closes the drawer
  top: $nav-drawer-offset;
  left: 0;
  width: 100%;
  height: calc(100% - #{$nav-drawer-offset});
  // above the page, below modals
  z-index: 35;
  visibility: hidden;
  transition: visibility 0s 0.25s;

  @include desktop {
    display: none;
  }

  &.is-active {
    visibility: visible;
    transition: visibility 0s 0s;

    .nav-drawer-backdrop {
      opacity: 1;
    }

    .nav-drawer-panel {
      transform: translateX(0);
    }
  }
}

.nav-drawer-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba($grey-accent, 0.7);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.nav-drawer-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  background-color: $navbar-background-color;
  transform: translateX(100%);
  transition: transform 0.25s ease;
}

.nav-drawer-body {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0.5rem 0;
}

.nav-drawer-link {
  @extend %reset;
  display: flex;
  align-items: center;
  gap: 0.75em;
  width: 100%;
  // comfortable thumb target
  min-height: 3rem;
  padding: 0 1rem;
  color: $navbar-item-color;
  text-align: left;
  cursor: pointer;

  &:hover,
  &:focus,
  &:active {
    color: $primary;
    background-color: rgba($white, 0.06);
  }

  &.router-link-exact-active {
    color: $primary;
  }

  &.is-nested {
    min-height: 2.75rem;
    padding-left: 3rem;
    color: rgba($white, 0.75);
  }
}

.nav-drawer-section {
  border-top: 1px solid rgba($white, 0.06);
  margin-top: 0.5rem;
  padding-top: 0.5rem;
}

.nav-drawer-chevron {
  margin-left: auto;
  transition: transform 0.2s ease;

  &.is-flipped {
    transform: rotate(180deg);
  }
}

.nav-drawer-account {
  border-top: 1px solid rgba($white, 0.08);
  padding-bottom: calc(1.25rem + env(safe-area-inset-bottom));
  padding-top: 1rem;
}

.nav-drawer-user {
  display: flex;
  align-items: center;
  gap: 0.75em;
  min-height: 3rem;
  padding: 0 1rem;
  color: rgba($white, 0.75);

  .avatar {
    width: 1.75em;
    height: 1.75em;
    border-radius: 50%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav-drawer,
  .nav-drawer-backdrop,
  .nav-drawer-panel,
  .nav-drawer-chevron {
    transition: none;
  }
}
</style>
