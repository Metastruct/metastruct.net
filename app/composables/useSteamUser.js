// Steam identity for banned players appealing on /appeal. Separate from useUser: that one
// is the GitHub login for the team, this one only proves which steamid the visitor owns.
export function useSteamUser() {
  const steamUser = useState("steamUser", () => ({}));
  // false until /auth/steam/me answered once, so pages can tell "loading" from "logged out"
  const steamUserLoaded = useState("steamUserLoaded", () => false);
  const { $mc } = useNuxtApp();

  async function fetchSteamUser() {
    try {
      steamUser.value = await $mc("/auth/steam/me");
    } catch {
      steamUser.value = {};
    }
    steamUserLoaded.value = true;
  }

  async function steamLogout() {
    await $mc("/auth/steam/logout", { method: "POST" }).catch(console.error);
    await fetchSteamUser();
  }

  return { steamUser, steamUserLoaded, fetchSteamUser, steamLogout };
}
