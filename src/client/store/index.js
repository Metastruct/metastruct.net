export const state = () => ({
  user: {},
});

export const mutations = {
  user(state, user) {
    state.user = user;
  },
};

export const actions = {
  nuxtServerInit(store, { req }) {
    if (req.user) {
      store.commit("user", req.user);
    }
  },
};
