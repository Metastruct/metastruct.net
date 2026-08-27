export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.config.globalProperties.$isEmpty = function (obj) {
    if (Array.isArray(obj)) return obj.length === 0;

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
    }
    return true;
  };
});
