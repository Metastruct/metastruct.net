export default ({ store, $axios, $config }) => {
  // @nuxtjs/axios only sends cookies to its baseURL; metaconcord is another host
  $axios.onRequest(config => {
    if (config.url.startsWith($config.metaconcordUrl)) config.withCredentials = true;
    return config;
  });

  store.dispatch("fetchUser");
};
