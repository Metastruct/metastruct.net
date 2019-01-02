import Vuex from "vuex"

const createStore = () => {
    return new Vuex.Store({
        state() {
            return {
                user: {},
                discordUser: {},
            }
        },
        mutations: {
            discordUser(state, user) {
                state.discordUser = user
            },
            user(state, user) {
                state.user = user
            },
        },
        actions: {
            nuxtServerInit(store, ctx) {
                if (ctx.req.user) {
                    store.commit("user", ctx.req.user)
                }
            }
        }
    })
}

export default createStore
