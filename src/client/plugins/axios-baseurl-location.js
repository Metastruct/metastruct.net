export default function ({ $axios, redirect }) {
	$axios.defaults.baseURL = "//" + window.location.host + "/";
}
