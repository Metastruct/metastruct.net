import Vuex from "vuex"

const createStore = () => {
    return new Vuex.Store({
        state() {
            return {
                discordUser: null,
            }
        },
        mutations: {
            discordUser(state, user) {
                state.discordUser = user
            },
        },
        actions: {
            nuxtServerInit(store, ctx) {}
        }
    })
}

export default createStore
