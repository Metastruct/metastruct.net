export const state = () => ({
  user: {},
});

export const mutations = {
  user(state, user) {
    state.user = user;
  },
};

export const actions = {
  async fetchUser({ commit }) {
    try {
      const { data } = await this.$axios.get(`${this.$config.metaconcordUrl}/auth/me`, {
        progress: false,
      });
      commit("user", data);
    } catch (err) {
      commit("user", {});
    }
  },
  async logout({ dispatch }) {
    await this.$axios
      .post(`${this.$config.metaconcordUrl}/auth/logout`, null, { progress: false })
      .catch(console.error);
    await dispatch("fetchUser");
  },
};
