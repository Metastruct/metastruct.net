import Vue from "vue";

Vue.prototype.$isEmpty = function (obj) {
	if (Array.isArray(obj)) return obj.isEmpty();

	for (const key in obj) {
		if (obj.hasOwnProperty(key)) return false;
	}
	return true;
};
