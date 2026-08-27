export default defineNuxtPlugin({
  // $mc has to exist before the first /auth/me call
  dependsOn: ["api"],
  setup() {
    useUser().fetchUser();
  },
});
