export default function ({ $axios, redirect }) {
    $axios.defaults.baseURL = window.location.origin
    if (window.location.port) $axios.defaults.baseURL =+ `:${window.location.port}`
}