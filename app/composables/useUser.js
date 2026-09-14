// The website session: one account with linked platforms and derived roles, see
// metaconcord's services/Accounts. Everything reads `user` from here.
const STAFF_ROLES = ["administrator", "developer"];

export const PROVIDERS = [
  { key: "steam", label: "Steam", icon: "steam", login: true, ingame: "Garry's Mod" },
  { key: "discord", label: "Discord", icon: "discord", login: true },
  { key: "github", label: "GitHub", icon: "github-circle", login: true },
  { key: "gitlab", label: "GitLab", icon: "gitlab", login: true },
  { key: "minecraft", label: "Minecraft", icon: "minecraft", login: false, ingame: "Minecraft" },
];

export function useUser() {
  const user = useState("user", () => ({}));
  // false until /auth/me answered once, so pages can tell "loading" from "logged out"
  const userLoaded = useState("userLoaded", () => false);
  const { $mc, $mcUrl } = useNuxtApp();

  const roles = computed(() => user.value.roles || []);
  const isStaff = computed(() => roles.value.some(r => STAFF_ROLES.includes(r)));
  const isAdmin = computed(() => roles.value.includes("administrator"));

  function hasRole(...wanted) {
    return roles.value.some(r => wanted.includes(r));
  }

  function linkFor(provider) {
    return (user.value.links || []).find(l => l.provider === provider);
  }

  // imported links only identify, they never prove ownership
  function verifiedLink(provider) {
    const link = linkFor(provider);
    return link && link.source !== "import" ? link : undefined;
  }

  /** Where a provider's OAuth starts; the same URL logs in or links, depending on the session. */
  function loginUrl(provider, redirect = "/") {
    return `${$mcUrl}/auth/${provider}?redirect=${encodeURIComponent(redirect)}`;
  }

  async function fetchUser() {
    try {
      user.value = await $mc("/auth/me");
    } catch {
      user.value = {};
    }
    userLoaded.value = true;
  }

  async function logout() {
    await $mc("/auth/logout", { method: "POST" }).catch(console.error);
    await fetchUser();
  }

  async function unlink(provider) {
    user.value = await $mc(`/auth/links/${provider}`, { method: "DELETE" });
  }

  function createLinkCode(provider) {
    return $mc("/auth/link-code", { method: "POST", body: { provider } });
  }

  return {
    user,
    userLoaded,
    roles,
    isStaff,
    isAdmin,
    hasRole,
    linkFor,
    verifiedLink,
    loginUrl,
    fetchUser,
    logout,
    unlink,
    createLinkCode,
  };
}
