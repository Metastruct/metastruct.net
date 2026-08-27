export function useUser() {
  const user = useState("user", () => ({}));
  // false until /auth/me answered once, so pages can tell "loading" from "logged out"
  const userLoaded = useState("userLoaded", () => false);
  const { $mc } = useNuxtApp();

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

  return { user, userLoaded, fetchUser, logout };
}
