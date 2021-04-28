export const state = () => ({
  user: {},
  discordUser: {},
});

export const mutations = {
  discordUser(state, user) {
    state.discordUser = user;
  },
  user(state, user) {
    state.user = user;
  },
};

export const actions = {
  nuxtServerInit(store, { req, $axios }) {
    if (req.user) {
      store.commit("user", req.user);
    }

    $axios
      .get("https://metastruct.net/discord/auth/info.json")
      .then(res => {
        store.commit("discordUser", res.data);
      })
      .catch(console.error);
  },
};
